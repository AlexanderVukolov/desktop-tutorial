import { useEffect, useState } from 'react';

const KEY = 'nutrios:session';

export function useSession() {
  const [signedIn, setSignedIn] = useState(() => window.localStorage.getItem(KEY) === '1');

  useEffect(() => {
    function onStorage() {
      setSignedIn(window.localStorage.getItem(KEY) === '1');
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return {
    signedIn,
    signIn: () => {
      window.localStorage.setItem(KEY, '1');
      setSignedIn(true);
    },
    signOut: () => {
      window.localStorage.removeItem(KEY);
      setSignedIn(false);
    },
  };
}
