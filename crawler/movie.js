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

const getMovieId = async (movieName) => {
  const movies = await fetchMovies();
  if (movies.length === 0) return null;
  const targetMovie = Object.entries(movies).find(([, value]) => value.includes(movieName));
  return targetMovie[0];
};

const fetchSchedule = async (movieName) => {
  const movieId = await getMovieId(movieName);
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

const getMySchedule = async (movieName) => {
  const schedule = await fetchSchedule(movieName);
  const mySchedule = schedule.filter((theater) => myTheaters.includes(theater.name));
  const result = mySchedule.length === 0 ? '這部電影在您指定的電影院沒有上映' : mySchedule;
  return result;
};

module.exports = {
  getMySchedule,
};
