import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true
      }
    });
    
    console.log('Total users in database:', users.length);
    console.log('Users:', JSON.stringify(users, null, 2));
    
    // Check specific user
    const specificUser = await prisma.user.findUnique({
      where: { email: 'pragya.shar3377@gmail.com' }
    });
    
    console.log('\nLooking for pragya.shar3377@gmail.com:', specificUser ? 'FOUND' : 'NOT FOUND');
    
    if (users.length === 0) {
      console.log('\n⚠️  No users found in database!');
      console.log('The user needs to register at http://localhost:3000/register first');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();