import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('Starting database reset...');

  try {
    // Delete all records in reverse order of dependencies
    console.log('Deleting calls...');
    await prisma.call.deleteMany();
    
    console.log('Deleting scheduled calls...');
    await prisma.scheduledCall.deleteMany();
    
    console.log('Deleting workers...');
    await prisma.worker.deleteMany();
    
    console.log('Deleting companies...');
    await prisma.company.deleteMany();
    
    console.log('Database reset complete!');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
