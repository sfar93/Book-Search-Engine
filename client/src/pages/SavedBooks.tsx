import { useQuery, useMutation } from '@apollo/client'; // Import Apollo hooks
import { Container, Card, Button, Row, Col } from 'react-bootstrap';

import { GET_ME } from '../utils/queries'; // Import GET_ME query
import { REMOVE_BOOK } from '../utils/mutation'; // Import REMOVE_BOOK mutation
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

// Define the SavedBook type
interface SavedBook {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image?: string;
}

const SavedBooks = () => {
  // Use the GET_ME query to fetch user data
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || {};

  // Use the REMOVE_BOOK mutation
  const [removeBookMutation] = useMutation(REMOVE_BOOK);

  // Create function that accepts the book's ID and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      // Use the REMOVE_BOOK mutation
      const { data } = await removeBookMutation({
        variables: { bookId },
      });

      if (!data) {
        throw new Error('Something went wrong!');
      }

      // Upon success, remove book's ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // If data isn't here yet, show a loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
            {userData.savedBooks?.map((book: SavedBook) => {
            return (
              <Col md='4' key={book.bookId}>
              <Card border='dark'>
                {book.image ? (
                <Card.Img
                  src={book.image}
                  alt={`The cover for ${book.title}`}
                  variant='top'
                />
                ) : null}
                <Card.Body>
                <Card.Title>{book.title}</Card.Title>
                <p className='small'>Authors: {book.authors}</p>
                <Card.Text>{book.description}</Card.Text>
                <Button
                  className='btn-block btn-danger'
                  onClick={() => handleDeleteBook(book.bookId)}
                >
                  Delete this Book!
                </Button>
                </Card.Body>
              </Card>
              </Col>
            );
            })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;