echo "console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
console.log('FAL_API_KEY:', process.env.FAL_API_KEY ? '✓ Set' : '✗ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);" > check-env.js