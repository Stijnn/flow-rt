import { ReactNode, useEffect, useState } from "react";
import { useProfile } from "./profile-provider";
import { Spinner } from "@/components/ui/spinner";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

enum AuthStatus {
  AUTHENTICATED,
  UNAUTHENTICATED,
  UNKNOWN,
}

const AuthenticationLoading = () => {
  return (
    <div className="flex flex-1 flex-col h-dvh w-dvw align-middle justify-center items-center">
      <Item variant="muted" size="default">
        <ItemMedia>
          <Spinner className="size-6 text-green-400" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Loading profile...</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  );
};

const Login = ({
  onTokenGiven,
}: {
  onTokenGiven: (token: string) => Promise<void> | void;
}) => {
  const [token, setToken] = useState<string | null>(null);

  return (
    <div className="px-64 flex flex-1 flex-col justify-center align-middle items-center w-dvw h-dvh">
      <div className="grid w-full gap-3">
        <Label htmlFor="message-2">Authenticate with API Token</Label>
        <Textarea
          onChange={(e) => {
            setToken(e.target.value);
          }}
          placeholder="Enter API Token here..."
          id="message-2"
        />
        <p className="text-muted-foreground text-sm">
          Your token will be used to fetch your profile and authenticate with
          HackTheBox.
        </p>
        <Button disabled={!!!token} onClick={() => onTokenGiven(token ?? "")}>
          Authenticate
        </Button>
      </div>
    </div>
  );
};

export const AUTH_TOKEN_LOCAL_STORAGE_KEY = "-auth-token";

export const Authenticator = ({ children }: { children: ReactNode }) => {
  const { authenticate } = useProfile();

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.UNKNOWN);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticating(true);

    if (!token) {
      setAuthStatus(AuthStatus.UNAUTHENTICATED);
      setIsAuthenticating(false);
      return;
    }

    authenticate(token)
      .then((_) => {
        localStorage.setItem(AUTH_TOKEN_LOCAL_STORAGE_KEY, token);
        setAuthStatus(AuthStatus.AUTHENTICATED);
      })
      .catch((e) => {
        localStorage.removeItem(AUTH_TOKEN_LOCAL_STORAGE_KEY);
        setAuthStatus(AuthStatus.UNAUTHENTICATED);
        console.error(e);
      })
      .finally(() => {
        setIsAuthenticating(false);
      });
  }, [token]);

  useEffect(() => {
    setToken(localStorage.getItem(AUTH_TOKEN_LOCAL_STORAGE_KEY));
  }, []);

  return (
    <>
      {(isAuthenticating || authStatus === AuthStatus.UNKNOWN) && (
        <AuthenticationLoading />
      )}
      {!isAuthenticating && authStatus === AuthStatus.UNAUTHENTICATED && (
        <Login onTokenGiven={(token) => setToken(token)} />
      )}
      {!isAuthenticating && authStatus === AuthStatus.AUTHENTICATED && children}
    </>
  );
};
