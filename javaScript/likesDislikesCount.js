document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.story').forEach(function (storyEl) {
    const storyId = storyEl.getAttribute('data-id');
    const likeBtn = storyEl.querySelector('.like-btn');
    const dislikeBtn = storyEl.querySelector('.dislike-btn');
    const likeCountEl = storyEl.querySelector('.like-count');

    let isLiked = localStorage.getItem(`liked-${storyId}`) === 'true';
    let likeCount = parseInt(localStorage.getItem(`like-count-${storyId}`)) || 0;

    likeCountEl.textContent = likeCount;

    likeBtn.addEventListener('click', function () {
      if (isLiked) {
        likeCount--;
        isLiked = false;
      } else {
        likeCount++;
        isLiked = true;
      }

      localStorage.setItem(`liked-${storyId}`, isLiked);
      localStorage.setItem(`like-count-${storyId}`, likeCount);
      likeCountEl.textContent = likeCount;
    });

    // Optional: Handle dislike if needed
    dislikeBtn.addEventListener('click', function () {
      alert("Thanks for your feedback!");
    });
  });
});
