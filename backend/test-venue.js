require('dotenv').config(); 
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 

async function r() { 
  try { 
    const venue = await prisma.venues.create({ 
      data: { 
        name: 'Test Venue', 
        address: '123', 
        city: 'Test', 
        state: 'Test', 
        capacity: 10 
      } 
    }); 
    console.log('Venue created:', venue); 
  } catch(e) { 
    console.error('Error:', e); 
  } finally { 
    await prisma.$disconnect(); 
  } 
} 
r();
