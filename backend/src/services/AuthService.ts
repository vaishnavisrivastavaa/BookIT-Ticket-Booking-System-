import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { MongoClient, ObjectId } from 'mongodb';

export class AuthService {
  static async register(data: any) {
    const { firstName, lastName, email, password, roleName } = data;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Find role
    const role = await prisma.roles.findUnique({ where: { name: roleName } });
    if (!role) {
      throw new Error('Role not found');
    }

    // Bypass Prisma transaction error for standalone MongoDB instances
    const client = new MongoClient(process.env.DATABASE_URL as string);
    await client.connect();
    const db = client.db();
    
    const result = await db.collection('users').insertOne({
      _id: new ObjectId(),
      first_name: firstName,
      last_name: lastName,
      email,
      password: hashedPassword,
      role_id: role.id,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    await client.close();

    const user = {
      id: result.insertedId.toString(),
      first_name: firstName,
      last_name: lastName,
      email,
      roles: role
    };

    const token = this.generateToken(user);
    
    return {
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: role.name
      }
    };
  }

  static async login(data: any) {
    const { email, password } = data;

    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        roles: true
      }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    const roleName = user.roles?.name || 'CUSTOMER';

    return {
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: roleName
      }
    };
  }

  static generateToken(user: any) {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRATION ? parseInt(process.env.JWT_EXPIRATION) + 'ms' : '24h' as any }
    );
  }
}
