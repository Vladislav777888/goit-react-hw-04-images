import { useEffect, useState } from 'react';

import { STATUS } from '../../constants';
import { getPosts, PER_PAGE as paginationLimit } from '../../services';
import { Wrapper } from './App.styled';
import { Searchbar } from '../Searchbar';
import { ImageGallery } from '../ImageGallery';
import { Loader } from '../Loader';
import { NotFound } from '../ImageGallery/NotFound';
import { Button } from '../Button';

export const App = () => {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState(STATUS.idle);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (search === '') {
      return;
    }

    const fetchPosts = async () => {
      setStatus(STATUS.loading);

      try {
        const data = await getPosts({ page, q: search });

        if (!data.totalHits) {
          throw new Error('We have nothing for this search');
        }

        if (page !== 1) {
          setPosts(prevState => [
            ...prevState,
            ...data.hits.map(({ id, webformatURL, largeImageURL }) => {
              return { id, webformatURL, largeImageURL };
            }),
          ]);
          setStatus(STATUS.success);
        } else {
          setPosts([
            ...data.hits.map(({ id, webformatURL, largeImageURL }) => {
              return { id, webformatURL, largeImageURL };
            }),
          ]);

          setStatus(STATUS.success);
        }

        if (data.hits.length < paginationLimit) {
          throw new Error('You loaded all posts');
        }
      } catch (error) {
        console.log(error);
        setStatus(STATUS.error);
      }
    };

    fetchPosts();
  }, [page, search]);

  const handleSubmit = searchValue => {
    setSearch(searchValue);
    setPage(1);
    setPosts([]);
  };

  const handleLoadMore = () => {
    setPage(prevState => prevState + 1);
  };

  return (
    <Wrapper>
      <Searchbar onSubmit={handleSubmit} />
      {posts.length > 0 && <ImageGallery posts={posts} />}

      {posts.length === 0 && status === STATUS.error && <NotFound />}

      {status === STATUS.success && <Button onClick={handleLoadMore} />}

      {status === STATUS.loading && <Loader />}
    </Wrapper>
  );
};
