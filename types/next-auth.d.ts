import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'PRODUCT_MANAGER';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'SUPER_ADMIN' | 'PRODUCT_MANAGER';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'SUPER_ADMIN' | 'PRODUCT_MANAGER';
  }
}
