-- Grant admin role to initial admin user
UPDATE public.users
SET role = 'admin'
WHERE email = 'jesusandresbeltranserrano@gmail.com';
