import axios from './cached-axios';
import { idToTags } from '../data/id_tags.js';

const API_BASE_URL = 'https://api.bgm.tv';

async function getSubjectDetails(subjectId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/v0/subjects/${subjectId}`);

    if (!response.data) {
      throw new Error('No subject details found');
    }
    // Get air date and current date
    const airDate = response.data.date;
    const currentDate = new Date();
    
    // If air date is in the future, return null to indicate this show should be ignored
    if (airDate && new Date(airDate) > currentDate) {
      return null;
    }

    let year = airDate ? parseInt(airDate.split('-')[0]) : null;
    
    // Extract meta tags and add animation studios
    // const persons = [];
    // const animationStudio = response.data.infobox?.find(item => item.key === '动画制作')?.value;
    // if (animationStudio && animationStudio.length < 50) {
    //   // Split by both '×' and '/' and trim whitespace from each studio
    //   const studioSplit = animationStudio.split(/[×/()、（）\[\]]/).map(studio => studio.trim()).filter(studio => studio.length < 30 && studio.length > 0);
    //   persons.push(...studioSplit);
    // }

    // const publisher = response.data.infobox?.find(item => item.key === '发行')?.value;
    // if (publisher && publisher.length < 50) {
    //   const studioTrim = publisher.split(/[×/()、（）\[\]]/)[0].trim();
    //   persons.push(studioTrim);
    // }
    
    const tags = [];
    if (response.data.type === 2) {
      response.data.tags.slice(0, 10)
        .filter(tag => !tag.name.includes('20'))
        .forEach(tag => tags.push({ [tag.name]: tag.count }));
    }
    if (response.data.type === 4) {
      response.data.tags.slice(0, 5)
        .filter(tag => !tag.name.includes('20'))
        .forEach(tag => tags.push({ [tag.name]: tag.count }));
    }

    return {
      name: response.data.name_cn || response.data.name,
      year,
      tags,
      meta_tags: response.data.meta_tags,
      rating: response.data.rating?.score || 0,
      rating_count: response.data.rating?.total || 0
    };
  } catch (error) {
    console.error('Error fetching subject details:', error);
    throw error;
  }
}

async function getCharacterAppearances(characterId, gameSettings) {
  try {
    const [subjectsResponse, personsResponse] = await Promise.all([
      axios.get(`${API_BASE_URL}/v0/characters/${characterId}/subjects`),
      axios.get(`${API_BASE_URL}/v0/characters/${characterId}/persons`)
    ]);

    if (!subjectsResponse.data || !subjectsResponse.data.length) {
      return {
        appearances: [],
        latestAppearance: -1,
        earliestAppearance: -1,
        highestRating: 0,
        metaTags: []
      };
    }

    let filteredAppearances;
    if (gameSettings.includeGame) {
      filteredAppearances = subjectsResponse.data.filter(appearance => 
        (appearance.staff === '主角' || appearance.staff === '配角')
        && (appearance.type === 2 || appearance.type === 4)
      );
    } else {
      filteredAppearances = subjectsResponse.data.filter(appearance => 
        (appearance.staff === '主角' || appearance.staff === '配角')
        && (appearance.type === 2)
      );
    }
    
    if (filteredAppearances.length === 0) {
      return {
        appearances: [],
        latestAppearance: -1,
        earliestAppearance: -1,
        highestRating: -1,
        metaTags: []
      };
    }

    let latestAppearance = -1;
    let earliestAppearance = -1;
    let highestRating = -1;
    const tagCounts = new Map(); // Track cumulative counts for each tag
    const metaTagCounts = new Map(); // Track cumulative counts for each meta tag
    const allMetaTags = new Set();

    // Get just the names and collect meta tags
    const appearances = await Promise.all(
      filteredAppearances.map(async appearance => {
        try {
          const details = await getSubjectDetails(appearance.id);
          
          if (!details || details.year === null) return null;

          if (!gameSettings.metaTags.filter(tag => tag !== '').every(tag => details.meta_tags.includes(tag))){
            return null;
          }
          
          if (latestAppearance === -1 || details.year > latestAppearance) {
            latestAppearance = details.year;
          }
          if (earliestAppearance === -1 || details.year < earliestAppearance) {
            earliestAppearance = details.year;
          }
          if (details.rating > highestRating) {
            highestRating = details.rating;
          }

          details.tags.forEach(tagObj => {
            const [[name, count]] = Object.entries(tagObj);
            tagCounts.set(name, (tagCounts.get(name) || 0) + count);
          });

          details.meta_tags.forEach(tag => {
            metaTagCounts.set(tag, (metaTagCounts.get(tag) || 0) + (tagCounts.get(tag) || 1));
          });

          return {
            name: details.name,
            rating_count: details.rating_count
          };

        } catch (error) {
          console.error(`Failed to get details for subject ${appearance.id}:`, error);
          return null;
        }
      })
    );

    // Convert tagCounts to array of objects and sort by count
    const sortedTags = Array.from(tagCounts.entries())
      .map(([name, count]) => ({ [name]: count }))
      .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

    const sortedMetaTags = Array.from(metaTagCounts.entries())
      .map(([name, count]) => ({ [name]: count }))
      .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

    for (const tagObj of sortedMetaTags) {
      if (allMetaTags.size >= gameSettings.subjectTagNum) break;
      allMetaTags.add(Object.keys(tagObj)[0]);
    }
    
    if (idToTags && idToTags[characterId]) {
      idToTags[characterId].slice(0, Math.min(gameSettings.characterTagNum, idToTags[characterId].length)).forEach(tag => allMetaTags.add(tag));
    }
    
    for (const tagObj of sortedTags) {
      if (allMetaTags.size >= gameSettings.subjectTagNum+gameSettings.characterTagNum) break;
      allMetaTags.add(Object.keys(tagObj)[0]);
    }
    
    const validAppearances = appearances
      .filter(appearance => appearance !== null)
      .sort((a, b) => b.rating_count - a.rating_count)
      .map(appearance => appearance.name);

    if (characterId === 56822 || characterId === 56823 || characterId === 17529 || characterId === 10956) {
      personsResponse.data = [];
      allMetaTags.add('展开');
    } 
    else if (personsResponse.data && personsResponse.data.length) {
      const animeVAs = personsResponse.data.filter(person => person.subject_type === 2 || person.subject_type === 4);
      if (animeVAs.length > 0) {
        animeVAs.forEach(person => {
          allMetaTags.add(`${person.name}`);
        });
      }
    }
    return {
      appearances: validAppearances,
      latestAppearance,
      earliestAppearance,
      highestRating,
      metaTags: Array.from(allMetaTags)
    };
  } catch (error) {
    console.error('Error fetching character appearances:', error);
    return {
      appearances: [],
      latestAppearance: -1,
      earliestAppearance: -1,
      highestRating: -1,
      metaTags: []
    };
  }
}

async function getCharacterDetails(characterId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/v0/characters/${characterId}`);

    if (!response.data) {
      throw new Error('No character details found');
    }

    // Extract Chinese name from infobox
    const nameCn = response.data.infobox?.find(item => item.key === '简体中文名')?.value || null;

    // Handle gender - only accept string values of 'male' or 'female'
    const gender = typeof response.data.gender === 'string' && 
      (response.data.gender === 'male' || response.data.gender === 'female') 
      ? response.data.gender 
      : '?';

    return {
      nameCn: nameCn,
      gender,
      image: response.data.images.medium,
      summary: response.data.summary,
      popularity: response.data.stat.collects
    };
  } catch (error) {
    console.error('Error fetching character details:', error);
    throw error;
  }
}

async function getCharactersBySubjectId(subjectId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/v0/subjects/${subjectId}/characters`);

    if (!response.data || !response.data.length) {
      throw new Error('No characters found for this anime');
    }

    const filteredCharacters = response.data.filter(character => 
      character.relation === '主角' || character.relation === '配角'
    );

    if (filteredCharacters.length === 0) {
      throw new Error('No main or supporting characters found for this anime');
    }
  
    return filteredCharacters;
  } catch (error) {
    console.error('Error fetching characters:', error);
    throw error;
  }
}

async function getRandomCharacter(gameSettings) {
  try {
    let subject;
    let total;
    let randomOffset;
    
    if (gameSettings.useIndex && gameSettings.indexId) {
      // Get index info first
      const indexInfo = await getIndexInfo(gameSettings.indexId);
      // Get total from index info
      total = indexInfo.total + gameSettings.addedSubjects.length; 
      
      // Get a random offset within the total number of subjects
      randomOffset = Math.floor(Math.random() * total);

      if (randomOffset >= indexInfo.total) {
        randomOffset = randomOffset - indexInfo.total;
        subject = gameSettings.addedSubjects[randomOffset];
      } else {
        // Fetch one subject from the index at the random offset
        const response = await axios.get(
          `${API_BASE_URL}/v0/indices/${gameSettings.indexId}/subjects?limit=1&offset=${randomOffset}`
        );

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          throw new Error('No subjects found in index');
        }

        subject = response.data.data[0];
      }
    } else {
      gameSettings.useIndex = false;
      total = gameSettings.topNSubjects+gameSettings.addedSubjects.length;
      
      randomOffset = Math.floor(Math.random() * total);
      const endDate = new Date(`${gameSettings.endYear + 1}-01-01`);
      const today = new Date();
      const minDate = new Date(Math.min(endDate.getTime(), today.getTime())).toISOString().split('T')[0];
      
      if (randomOffset >= gameSettings.topNSubjects) {
        randomOffset = randomOffset - gameSettings.topNSubjects;
        subject = gameSettings.addedSubjects[randomOffset];
      } else {
        // Fetch one subject at the random offset
        const response = await axios.post(`${API_BASE_URL}/v0/search/subjects?limit=1&offset=${randomOffset}`, {
          "sort": "heat",
          "filter": {
            "type": [2],
            "air_date": [
              `>=${gameSettings.startYear}-01-01`,
              `<${minDate}`
            ],
            "meta_tags": gameSettings.metaTags.filter(tag => tag !== "")
          }
        });

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          throw new Error('Failed to fetch subject at random offset');
        }

        subject = response.data.data[0];
      }
    }

    // Get characters for the selected subject
    const characters = await getCharactersBySubjectId(subject.id);
    
    // Filter and select characters based on mainCharacterOnly setting
    const filteredCharacters = gameSettings.mainCharacterOnly
      ? characters.filter(character => character.relation === '主角')
      : characters.filter(character => character.relation === '主角' || character.relation === '配角').slice(0, gameSettings.characterNum);

    if (filteredCharacters.length === 0) {
      throw new Error('No characters found for this anime');
    }

    // Randomly select one character from the filtered characters
    const selectedCharacter = filteredCharacters[Math.floor(Math.random() * filteredCharacters.length)];

    // Get additional character details
    const characterDetails = await getCharacterDetails(selectedCharacter.id);

    // Get character appearances
    const appearances = await getCharacterAppearances(selectedCharacter.id, gameSettings);

    return {
      ...selectedCharacter,
      ...characterDetails,
      ...appearances
    };
  } catch (error) {
    console.error('Error getting random character:', error);
    throw error;
  }
}

function generateFeedback(guess, answerCharacter) {
  const result = {};

  result.gender = {
    guess: guess.gender,
    feedback: guess.gender === answerCharacter.gender ? 'yes' : 'no'
  };

  const popularityDiff = guess.popularity - answerCharacter.popularity;
  const fivePercent = answerCharacter.popularity * 0.05;
  const twentyPercent = answerCharacter.popularity * 0.2;
  let popularityFeedback;
  if (Math.abs(popularityDiff) <= fivePercent) {
    popularityFeedback = '=';
  } else if (popularityDiff > 0) {
    popularityFeedback = popularityDiff <= twentyPercent ? '+' : '++';
  } else {
    popularityFeedback = popularityDiff >= -twentyPercent ? '-' : '--';
  }
  result.popularity = {
    guess: guess.popularity,
    feedback: popularityFeedback
  };

  // Handle rating comparison
  const ratingDiff = guess.highestRating - answerCharacter.highestRating;
  const ratingFivePercent = answerCharacter.highestRating * 0.02;
  const ratingTwentyPercent = answerCharacter.highestRating * 0.1;
  let ratingFeedback;
  if (guess.highestRating === -1 || answerCharacter.highestRating === -1) {
    ratingFeedback = '?';
  } else if (Math.abs(ratingDiff) <= ratingFivePercent) {
    ratingFeedback = '=';
  } else if (ratingDiff > 0) {
    ratingFeedback = ratingDiff <= ratingTwentyPercent ? '+' : '++';
  } else {
    ratingFeedback = ratingDiff >= -ratingTwentyPercent ? '-' : '--';
  }
  result.rating = {
    guess: guess.highestRating,
    feedback: ratingFeedback
  };

  const sharedAppearances = guess.appearances.filter(appearance => answerCharacter.appearances.includes(appearance));
  result.shared_appearances = {
    first: sharedAppearances[0] || '',
    count: sharedAppearances.length
  };

  // Compare total number of appearances
  const appearanceDiff = guess.appearances.length - answerCharacter.appearances.length;
  const twentyPercentAppearances = answerCharacter.appearances.length * 0.2;
  let appearancesFeedback;
  if (appearanceDiff === 0) {
    appearancesFeedback = '=';
  } else if (appearanceDiff > 0) {
    appearancesFeedback = appearanceDiff <= twentyPercentAppearances ? '+' : '++';
  } else {
    appearancesFeedback = appearanceDiff >= -twentyPercentAppearances ? '-' : '--';
  }
  result.appearancesCount = {
    guess: guess.appearances.length,
    feedback: appearancesFeedback
  };

  // Advice from EST-NINE
  const answerMetaTagsSet = new Set(answerCharacter.metaTags);
  const sharedMetaTags = guess.metaTags.filter(tag => answerMetaTagsSet.has(tag));
  
  result.metaTags = {
    guess: guess.metaTags,
    shared: sharedMetaTags
  };

  if (guess.latestAppearance === -1 || answerCharacter.latestAppearance === -1) {
    result.latestAppearance = {
      guess: guess.latestAppearance === -1 ? '?' : guess.latestAppearance,
      feedback: guess.latestAppearance === -1 && answerCharacter.latestAppearance === -1 ? '=' : '?'
    };
  } else {
    const yearDiff = guess.latestAppearance - answerCharacter.latestAppearance;
    let yearFeedback;
    if (yearDiff === 0) {
      yearFeedback = '=';
    } else if (yearDiff > 0) {
      yearFeedback = yearDiff <= 2 ? '+' : '++';
    } else {
      yearFeedback = yearDiff >= -2 ? '-' : '--';
    }
    result.latestAppearance = {
      guess: guess.latestAppearance,
      feedback: yearFeedback
    };
  }

  if (guess.earliestAppearance === -1 || answerCharacter.earliestAppearance === -1) {
    result.earliestAppearance = {
      guess: guess.earliestAppearance,
      feedback: guess.earliestAppearance === -1 && answerCharacter.earliestAppearance === -1 ? '=' : '?'
    };
  } else {
    const yearDiff = guess.earliestAppearance - answerCharacter.earliestAppearance;
    let yearFeedback;
    if (yearDiff === 0) {
      yearFeedback = '=';
    } else if (yearDiff > 0) {
      yearFeedback = yearDiff <= 1 ? '+' : '++';
    } else {
      yearFeedback = yearDiff >= -1 ? '-' : '--';
    }
    result.earliestAppearance = {
      guess: guess.earliestAppearance,
      feedback: yearFeedback
    };
  }

  return result;
}

async function getIndexInfo(indexId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/v0/indices/${indexId}`);
    
    if (!response.data) {
      throw new Error('No index information found');
    }

    return {
      title: response.data.title,
      total: response.data.total
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Index not found');
    }
    console.error('Error fetching index information:', error);
    throw error;
  }
}

async function searchSubjects(keyword) {
  try {
    const response = await axios.post(`${API_BASE_URL}/v0/search/subjects`, {
      keyword: keyword.trim(),
      filter: {
        // type: [2]  // Only anime
        type: [2, 4]  // anime and game
      }
    });

    if (!response.data || !response.data.data) {
      return [];
    }

    return response.data.data.map(subject => ({
      id: subject.id,
      name: subject.name,
      name_cn: subject.name_cn,
      image: subject.images?.grid || subject.images?.medium || '',
      date: subject.date,
      type: subject.type==2 ? '动漫' : '游戏'
    }));
  } catch (error) {
    console.error('Error searching subjects:', error);
    return [];
  }
}

export {
  getRandomCharacter,
  getCharacterAppearances,
  getCharactersBySubjectId,
  getCharacterDetails,
  generateFeedback,
  getIndexInfo,
  searchSubjects
}; 