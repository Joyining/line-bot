const axios = require('axios');
const cheerio = require('cheerio');

const fetchMovies = async () => {
  try {
    const response = await axios.get(
      'https://movies.yahoo.com.tw/ajax/in_theater_movies',
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const getMovie = async (movieName) => {
  const movies = await fetchMovies();
  if (movies.length === 0) return null;
  const targetMovie = Object.entries(movies).find(([, value]) => value.includes(movieName));
  if (!targetMovie) return null;
  return {
    movieId: targetMovie[0],
    fullMovieName: targetMovie[1],
  };
};

const fetchSchedule = async ({
  movieId,
  date: inputDate = '',
}) => {
  // TODO: time utils
  const date = inputDate ? new Date(inputDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  try {
    const response = await axios.get(
      `https://movies.yahoo.com.tw/ajax/pc/get_schedule_by_movie?movie_id=${movieId}&date=${date}`,
    );
    const { view } = response.data;
    const $ = cheerio.load(view);
    const timeTable = $('ul.area_time');
    const schedule = [];
    timeTable.each((index, element) => {
      const theaterName = $(element).data('theater_name');
      const timeLabels = $(element).find('li.time label');
      const times = [];
      timeLabels.each((i, e) => {
        times.push($(e).text());
      });
      schedule.push({
        name: theaterName,
        times,
      });
    });
    return schedule;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const myTheaters = [
  '欣欣秀泰影城',
  '京站威秀影城',
  '光點華山電影館',
  '誠品電影院',
  '台北天母新光影城',
];

const getMySchedule = async ({
  movieId,
  date,
}) => {
  const schedule = await fetchSchedule({
    movieId,
    date,
  });
  return schedule.filter((theater) => myTheaters.includes(theater.name));
};

const getMessages = async ({
  movieName,
  date: inputDate = '',
}) => {
  let messages = [];
  const date = inputDate ? new Date(inputDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const movie = await getMovie(movieName);
  if (!movie) {
    messages.push({
      type: 'text',
      text: `${movieName} 在 ${date} 沒有在您指定的電影院上映`,
    });
    return messages;
  }
  const { movieId, fullMovieName } = movie;
  const mySchedule = await getMySchedule({
    movieId,
    date,
  });
  messages = mySchedule.map((s) => {
    const times = s.times.join(' / ');
    return {
      type: 'text',
      text: `${s.name}: ${times}`,
    };
  });
  const titleText = mySchedule.length === 0 ? `${fullMovieName} 在 ${date} 沒有在您指定的電影院上映` : `${fullMovieName} 在 ${date} 的放映時間`;
  messages.unshift({
    type: 'text',
    text: titleText,
  });
  return messages;
};

module.exports = {
  getMessages,
};
