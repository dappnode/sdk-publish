import { createStore, applyMiddleware, Action } from "redux";
import createSagaMiddleware from "redux-saga";

// App modules
import rootSaga from "./sdk/sagas";
import rootReducer from "./sdk/reducer";

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();

const middlewares = [sagaMiddleware];

const store = createStore(
  rootReducer as any, // new root reducer with router state,
  applyMiddleware(...middlewares)
);

// ##### DEV
// @ts-ignore
window.dispach = store.dispatch;
// @ts-ignore
window.store = store;

export default store;

// Run the saga
sagaMiddleware.run(rootSaga);
