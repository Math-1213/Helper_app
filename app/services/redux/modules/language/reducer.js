const initialState = {
    language: {
        selectedLanguage: null
    },
};

export const language = (state = initialState, action) => {
    switch (action.type) {
        case '@language/SET_LANGUAGE':
          return {
            ...state,
            language: action.payload,
          };

          default:
            return state;
    }
}