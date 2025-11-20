import 'next-auth';
import 'next-auth/jwt';

// Unified type declarations supporting both admin and customer sessions
declare module 'next-auth' {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    // Admin-specific properties
    role?: 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN';
    // Customer-specific properties
    phoneNumber?: string;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      // Admin-specific properties
      role?: 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN';
      // Customer-specific properties
      phoneNumber?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    name: string | null;
    email: string | null;
    // Admin-specific properties
    role?: 'SUPER_ADMIN' | 'SHOP_MANAGER' | 'SALESMAN';
    // Customer-specific properties
    phoneNumber?: string;
  }
}
