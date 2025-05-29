const loggedInEmail = localStorage.getItem("email"); // must be set at login

fetch(`/stories?user=${loggedInEmail}`)
  .then(res => res.json())
  .then(stories => {
    stories.forEach(story => {
      if (story.speaker === loggedInEmail) {
        const storyElement = document.createElement('div');
        storyElement.innerHTML = `
          <h3>${story.title}</h3>
          <p>${story.intro}</p>
          <button onclick="editStory('${story._id}')">Edit</button>
          <button onclick="deleteStory('${story._id}')">Delete</button>
        `;
        document.getElementById('storyList').appendChild(storyElement);
      }
    });
  });
