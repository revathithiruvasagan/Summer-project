import { createStore, combineReducers } from "redux";
import { Provider } from "react-redux";
import userReducer from "./redux/userReducer";

const rootReducer = combineReducers({
  user: userReducer,
});

const store = createStore(rootReducer);

export default store;
