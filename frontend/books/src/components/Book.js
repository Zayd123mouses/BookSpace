import { useState, useEffect } from 'react'
import { useMatch } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  addBook,
  deleteBookAction,
  updateBookAction,
} from '../reducers/userBooksReducer'
import googleService from '../services/googleApi'
import {
  Rating,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Paper,
} from '@mui/material'
import CommentPop from './Commentpop'
import ListComments from './Comments'
import Form from 'react-bootstrap/Form'
import { useNavigate } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import { setNotification } from '../reducers/notificationReducer'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import ShopOutlinedIcon from '@mui/icons-material/ShopOutlined'

const Book = () => {
  const [book, setBook] = useState([])
  const [starred, setStarred] = useState(false)
  const [review, setReview] = useState(0)
  const [isDesktop, setDesktop] = useState(window.innerWidth > 600)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const user = useSelector((state) => state.user)
  const bookInShelve = useSelector(({ userBooks }) =>
    userBooks.find((bookInShelve) => bookInShelve.book_id === book.id)
  )
  //TODO: Save other relevant data to display on individual view of saved books

  // if refresh the page , search google api and get the book
  const match = useMatch('/books/:id')
  useEffect(() => {
    if (match) {
      googleService.getBook(match.params.id).then((book) => setBook(book))
    }
  }, [match]) //this should render only once.

  useEffect(() => {
    if (bookInShelve) {
      setStarred(true)
      setReview(bookInShelve.review)
    }
  }, [bookInShelve])

  const updateMedia = () => {
    setDesktop(window.innerWidth > 650)
  }

  useEffect(() => {
    window.addEventListener('resize', updateMedia)
    return () => window.removeEventListener('resize', updateMedia)
  })

  const saveBookToMyShelve = (state, review) => {
    if (!user) {
      return navigate('/login')
    }
    const bookToSave = {
      user_id: user.user_id,
      book_title: book.volumeInfo.title,
      book_state: state,
      book_id: book.id,
      book_image: book.volumeInfo.imageLinks.thumbnail,
      review: state === 'read' && review ? review : 0,
    }

    dispatch(addBook(bookToSave))
  }

  const updateShelf = (state, review) => {
    if (!user) {
      return navigate('/login')
    }
    const bookToUpdate = {
      user_id: user.user_id,
      book_title: book.volumeInfo.title,
      book_state: state,
      book_id: book.id,
      book_image: book.volumeInfo.imageLinks.thumbnail,
      review: state === 'read' && review ? review : 0,
    }
    dispatch(updateBookAction(book.id, bookToUpdate))
  }

  const removeBookFromMyShelve = () => {
    dispatch(deleteBookAction(book.id))
    dispatch(setNotification('book removed from your shelf', 'success'))
  }

  const handleSelectChange = (event) => {
    if (!user) {
      dispatch(setNotification('Please login first', 'error'))
      return navigate('/login')
    }
    if (starred && event.target.value === 'none') {
      removeBookFromMyShelve()
      setStarred(false)
      setReview(0)
    } else if (starred) {
      return updateShelf(event.target.value)
    } else {
      return saveBookToMyShelve(event.target.value)
    }
  }

  const setSelect = () => {
    if (starred) {
      return (
        <Form.Select
          id={book.id}
          value={bookInShelve.book_state}
          onChange={handleSelectChange}
        >
          <option value='none' disabled>
            Move to...
          </option>
          <option value='reading'>Currently Reading</option>
          <option value='toRead'>Want to Read</option>
          <option value='read'>Read</option>
          <option value='none'>None</option>
        </Form.Select>
      )
    } else {
      return (
        <Form.Select id={book.id} onChange={handleSelectChange} value='none'>
          <option value='none' disabled>
            Move to...
          </option>
          <option value='reading'>Currently Reading</option>
          <option value='toRead'>Want to Read</option>
          <option value='read'>Read</option>
          <option value='none'>None</option>
        </Form.Select>
      )
    }
  }

  const handleStars = (event) => {
    if (!user) {
      dispatch(setNotification('Please login first', 'error'))
      return navigate('/login')
    }
    setReview(Number(event.target.value))
    if (starred) {
      updateShelf('read', Number(event.target.value))
    } else {
      saveBookToMyShelve('read', Number(event.target.value))
    }
  }

  if (book.length < 1) {
    return (
      <Box
        sx={{
          height: '92vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 1, m: 1 }}>
      <Typography
        variant='h4'
        component='h1'
        fontWeight='bold'
        sx={{ textAlign: { xs: 'center', sm: 'left' }, p: 1 }}
      >
        {book.volumeInfo.title}
      </Typography>

      <Divider color='black' sx={{ mb: 1 }} />
      <Grid container height='auto'>
        <Grid item xs={12} sm={4} display='flex'>
          <Grid item xs={12} sm={12} sx={{ p: 0.5, m: 0.5 }}>
            <Box
              component='img'
              src={
                book.volumeInfo.imageLinks
                  ? book.volumeInfo.imageLinks.large
                    ? book.volumeInfo.imageLinks.large
                    : book.volumeInfo.imageLinks.thumbnail
                  : ''
              }
              alt='book cover'
              sx={{ width: '100%', height: 'auto' }}
            />
            <Box display='flex' sx={{ m: 1 }}>
              <Button
                variant='contained'
                component='a'
                target='_blank'
                href={book.volumeInfo.previewLink}
                sx={{ mr: 1 }}
              >
                <AutoStoriesOutlinedIcon fontSize='large' />
              </Button>
              <Button
                variant='contained'
                component='a'
                href={book.volumeInfo.infoLink}
              >
                <ShopOutlinedIcon fontSize='large' />
              </Button>
            </Box>
            {isDesktop && <ListComments book_id={book.id} />}
          </Grid>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Grid item xs={12} sm={12} sx={{ p: 1, m: 1 }}>
            {book.volumeInfo.authors &&
              book.volumeInfo.authors.map((author) => {
                return (
                  <Typography variant='body1' fontWeight='bold' key={author}>
                    {author}
                  </Typography>
                )
              })}
            <Box sx={{ my: 1 }}>
              <Typography variant='body1'>
                {book.volumeInfo.publisher},{' '}
                {book.volumeInfo.publishedDate.slice(0, 4)}
              </Typography>
              {book.volumeInfo.categories &&
                book.volumeInfo.categories.map((category) => {
                  return (
                    <Typography variant='body1' key={category}>
                      {category}
                    </Typography>
                  )
                })}
              <Typography variant='body1'>
                {book.volumeInfo.pageCount} pages
              </Typography>
            </Box>
            <Rating
              name='size-large'
              value={review}
              onChange={handleStars}
              size='large'
              sx={{ mb: 2 }}
            />

            {setSelect()}
            {isDesktop && (
              <CommentPop
                review_value={review}
                setReviewParent={setReview}
                starred={starred}
                updateShelf={updateShelf}
                saveBookToMyShelve={saveBookToMyShelve}
                book_id={book.id}
                bookInShelve={bookInShelve}
              />
            )}
            <Divider color='black' sx={{ my: 2 }} />
            <Typography
              variant='body1'
              dangerouslySetInnerHTML={{
                __html: book.volumeInfo.description
                  ? book.volumeInfo.description
                  : 'No description available',
              }}
            />
            {!isDesktop && (
              <>
                <Divider color='black' sx={{ mb: 5 }} />
                <CommentPop
                  review_value={review}
                  setReviewParent={setReview}
                  starred={starred}
                  updateShelf={updateShelf}
                  saveBookToMyShelve={saveBookToMyShelve}
                  book_id={book.id}
                  bookInShelve={bookInShelve}
                />
                <ListComments book_id={book.id} />
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Book
