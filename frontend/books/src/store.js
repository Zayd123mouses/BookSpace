import { configureStore } from '@reduxjs/toolkit'
import userBooksReducer from './reducers/userBooksReducer'
import userReducer from './reducers/userReducer'
import testReducer from './reducers/testBookreducer'
import commentsReducer from './reducers/commentsReducer'
import notificationReducer from './reducers/notificationReducer'
export const store = configureStore({
  reducer: {
    user: userReducer,
    userBooks: userBooksReducer,
    testReducer:testReducer,
    comments: commentsReducer,
    notification: notificationReducer
  },
})
