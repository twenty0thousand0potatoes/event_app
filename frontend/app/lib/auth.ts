export const saveToken = (token: string) => {
  localStorage.setItem("token", token);
};

export const saveTemporaryToken = (temporaryToken: string) => {
  localStorage.setItem("temporaryToken", temporaryToken);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getTemporaryToken = () => {
    return localStorage.getItem("temporaryToken");
  };

export const clearToken = () => {
  localStorage.removeItem("token");
};

export const clearTemporaryToken = () => {
    localStorage.removeItem("temporaryToken");
  };
  