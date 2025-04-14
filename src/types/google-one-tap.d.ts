
// Type definitions for Google One Tap API
interface CredentialResponse {
  credential: string;
  select_by: string;
}

interface GsiButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

interface IdConfiguration {
  client_id: string;
  auto_select?: boolean;
  callback?: (response: CredentialResponse) => void;
  login_uri?: string;
  native_callback?: (response: CredentialResponse) => void;
  cancel_on_tap_outside?: boolean;
  prompt_parent_id?: string;
  nonce?: string;
  context?: string;
  state_cookie_domain?: string;
  ux_mode?: 'popup' | 'redirect';
  allowed_parent_origin?: string | string[];
  intermediate_iframe_close_callback?: () => void;
}

interface GsiClient {
  initialize: (idConfiguration: IdConfiguration) => void;
  prompt: (momentListener?: (promptMoment: any) => void) => void;
  renderButton: (
    parent: HTMLElement,
    options?: GsiButtonConfiguration
  ) => void;
  disableAutoSelect: () => void;
}

interface GoogleAccountsId {
  initialize: (idConfiguration: IdConfiguration) => void;
  prompt: (momentListener?: (promptMoment: any) => void) => void;
  renderButton: (
    parent: HTMLElement,
    options?: GsiButtonConfiguration
  ) => void;
  disableAutoSelect: () => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
  oauth2: {
    initTokenClient: (config: any) => any;
    hasGrantedAllScopes: (token: any, ...scopes: string[]) => boolean;
  };
}

interface Window {
  google?: {
    accounts: GoogleAccounts;
  };
}
