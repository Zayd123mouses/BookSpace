import { useState } from 'react'

const getQuery = () => {
  let query
  const lastSearch = JSON.parse(localStorage.getItem('lastSearch'))
  //   console.log('lastSearch', lastSearch.query)

  if (lastSearch) {
    query = lastSearch.query
  } else {
    query = ''
  }

  return query
}

export const useField = (type) => {
  const [value, setValue] = useState(type === 'searchBooks' ? getQuery() : '')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  return {
    value,
    onChange,
    type,
  }
}
