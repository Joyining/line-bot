const axios = require('axios');
const cheerio = require('cheerio');

const fetchMovies = async () => {
  try {
    const response = await axios.get(
      'https://movies.yahoo.com.tw/ajax/in_theater_movies',
    );
    return response.data;
  } catch (error) {
    return [];
  }
};

const getMovie = async (movieName) => {
  const movies = await fetchMovies();
  if (movies.length === 0) return null;
  const targetMovie = Object.entries(movies).find(([, value]) => value.includes(movieName));
  return {
    movieId: targetMovie[0],
    fullMovieName: targetMovie[1],
  };
};

const fetchSchedule = async (movieId) => {
  // TODO: allow user assign area
  // TODO: allow user assign date
  const areaId = 28;
  const date = '2022-12-13';
  try {
    const response = await axios.get(
      `https://movies.yahoo.com.tw/ajax/pc/get_schedule_by_movie?movie_id=${movieId}&area_id=${areaId}&date=${date}`,
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
    return error;
  }
};

const myTheaters = [
  '欣欣秀泰影城',
  '京站威秀影城',
  '光點華山電影館',
  '誠品電影院',
  '台北天母新光影城',
];

const getMySchedule = async (movieId) => {
  const schedule = await fetchSchedule(movieId);
  return schedule.filter((theater) => myTheaters.includes(theater.name));
};

const getMessages = async (movieName) => {
  const { movieId, fullMovieName } = await getMovie(movieName);
  const mySchedule = await getMySchedule(movieId);
  const messages = mySchedule.map((s) => {
    const times = s.times.join('/');
    return {
      type: 'text',
      text: `${s.name}: ${times}`,
    };
  });
  const titleText = mySchedule.length === 0 ? '這部電影在您指定的電影院沒有上映' : `${fullMovieName} 在 2022-12-13 的放映時間`;
  messages.unshift({
    type: 'text',
    text: titleText,
  });
  return messages;
};

module.exports = {
  getMessages,
};
