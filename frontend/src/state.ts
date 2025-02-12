const state = {
	user: {
	  username: "Invité",
	  email: "",
	},
  };
  
  export function getUser() {
	return state.user;
  }
  
  export function setUser(newUser: { username: string; email: string }) {
	state.user = newUser;
  }
  