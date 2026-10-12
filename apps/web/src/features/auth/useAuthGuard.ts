import { useEffect } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from './AuthContext';
import { redirectFor } from './guard';

/**
 * Mounted once in the shell: sends the user where `redirectFor` says, replacing the history entry (so Back
 * never returns to the page they were turned away from). Protected screens render nothing private until
 * `useAuth().status` is `signedIn`.
 */
export function useAuthGuard() {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const target = redirectFor(pathname, status);
  useEffect(() => {
    if (target) router.replace(target);
  }, [target, router]);
}
