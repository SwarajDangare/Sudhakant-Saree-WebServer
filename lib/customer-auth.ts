import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db, customers } from '@/db';
import { eq } from 'drizzle-orm';

// Customer authentication configuration (phone-based)
export const customerAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'phone-login',
      name: 'Phone Login',
      credentials: {
        phoneNumber: { label: 'Phone Number', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber) {
          throw new Error('Phone number is required');
        }

        // Normalize phone number (remove spaces, dashes, etc.)
        const normalizedPhone = credentials.phoneNumber.replace(/\D/g, '');

        // Check if customer exists
        const [existingCustomer] = await db
          .select()
          .from(customers)
          .where(eq(customers.phoneNumber, normalizedPhone))
          .limit(1);

        if (existingCustomer) {
          // Return existing customer
          return {
            id: existingCustomer.id,
            phoneNumber: existingCustomer.phoneNumber,
            name: existingCustomer.name || credentials.name || null,
            email: existingCustomer.email || null,
          };
        }

        // Create new customer if doesn't exist
        const [newCustomer] = await db
          .insert(customers)
          .values({
            phoneNumber: normalizedPhone,
            name: credentials.name || null,
          })
          .returning();

        return {
          id: newCustomer.id,
          phoneNumber: newCustomer.phoneNumber,
          name: newCustomer.name,
          email: newCustomer.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phoneNumber = user.phoneNumber;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `customer.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get customer from session
export async function getCurrentCustomer(session: any) {
  if (!session?.user?.id) {
    return null;
  }

  const [customer] = await db
    .select()
    .from(customers)
    .where(eq(customers.id, session.user.id))
    .limit(1);

  return customer || null;
}

// Helper function to update customer info
export async function updateCustomerInfo(
  customerId: string,
  data: { name?: string; email?: string }
) {
  const [updatedCustomer] = await db
    .update(customers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(customers.id, customerId))
    .returning();

  return updatedCustomer;
}
