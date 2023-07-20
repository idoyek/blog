const { Tags } = require('../model/Tags');
const { Claps } = require('../model/Claps');

const filterPosts = (filteredPosts, queryParam, value) => {
    switch (queryParam) {
      case 'popularity':
        const popularity = Number(value);
        filteredPosts = filteredPosts.filter((post) => Claps[post.id] >= popularity);
        break;
      case 'tagName':
        const tagName = String(value);
        filteredPosts = filteredPosts.filter((post) => Tags[tagName] && Tags[tagName][post.id] === true);
        break;
    }
    return filteredPosts;
}

module.exports = { filterPosts };