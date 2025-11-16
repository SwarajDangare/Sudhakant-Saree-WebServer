export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/products/:path*', '/admin/categories/:path*', '/admin/users/:path*'],
};
