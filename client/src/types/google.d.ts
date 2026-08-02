// Google Identity Services type declaration
interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        renderButton: (element: HTMLElement, config: any) => void;
        prompt: () => void;
        disableAutoSelect: () => void;
      };
    };
  };
}

