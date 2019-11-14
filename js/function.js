let select = document.getElementById("select-per-page"); // Drop-down list element
let photoWrapp = document.getElementById("photoWrapp"); // Div element for to show photos.
let text = document.getElementById("txt"); // Get search word from input.
let modalContent = document.querySelector(".modal-content"); // Div element for modal.
let resultNum = document.getElementById("resultNum"); // P element to show search results number.
let pageNum = document.getElementById("pageNum"); // Div element to show page number.
let perPage; // Selected index of drop-down list.
let data; // JSON body content.
let totalPages = 0; // Total page number.
let currentPage = 1; // Current page number.
var slideIndex = 1; // Slide index on modal.

//*********************** event listeners **************************************************

// When you change the value of drop-down list.
select.addEventListener(
  "change",
  async function() {
    perPage = select.options[select.selectedIndex]; // Save current selected index of drop-down list.

    // If there are photos already.
    if (totalPages !== 0) {
      data = await getPhotos(text.value, perPage.value); // Save current JSON body content with new search text and per page number.

      // Get photos and page number.
      updateUI(data);
      getPageNum(data);
    }
  },
  false
);

// When you press enter button on input field.
document.getElementById("txt").addEventListener(
  "keypress",
  async function(e) {
    // Use either which or keyCode, depending on browser support.
    var key = e.which || e.keyCode;

    // 13 is enter.
    if (key === 13) {
      currentPage = 1; // Clear current page number.
      perPage = select.options[select.selectedIndex]; // current selected index of drop-down list.
      data = await getPhotos(text.value, perPage.value); // current JSON body content with new search text and per page number.

      // Get photos and page number.
      updateUI(data);
      getPageNum(data);
    }
  },
  false
);

//*********************** functions ******************************************************

// Get photos from flickr api.
async function getPhotos(textValue, perPageValue) {
  const apiKey = "8424c0abe1c7519605dd5ea394bb10cc";
  const baseUrl = "https://www.flickr.com/services/rest";
  let method = "flickr.photos.search";
  let format = "json";

  // Set url to get response from flickr.
  let url = `${baseUrl}/?method=${method}&api_key=${apiKey}&format=${format}&nojsoncallback=1&per_page=${perPageValue}&text=${textValue}&page=${currentPage}`;

  // This is just an HTTP response.
  let data = await fetch(url).then(function(response) {
    return response.json(); // Extract the JSON body content from the response.
  });
  return data.photos; // Return photo data of the response.
}

// Update photos and modal.
function updateUI(data) {
  photoWrapp.innerHTML = ""; // Clear photos.
  modalContent.innerHTML = ""; // Clear modal.

  try {
    // If there is a search text and current page number is bigger than the total page number.
    if (text.value !== "" && data.pages < currentPage) {
      totalPages =
        perPage.value * data.pages > 4000 ? 4000 / perPage.value : data.pages; // totalPages = 4000 / perPage or total page number.
      onPageLinkClick(totalPages); // Get current page number and photos.

      // If there is a search text
    } else if (text.value !== "") {
      for (
        let i = 0;
        i < (data.photo.length > 4000 ? 4000 : data.photo.length); // 4000 or data.photo.length.
        i++
      ) {
        // Append elements in the html document.
        photoWrapp.innerHTML += imgUrl(data, "n", i); // Set img url and create photo elements.
        modalContent.innerHTML += largeImgUrl(data, "b", i); // Set large img url and create photo elements for modal.
        modalContent.innerHTML += addPlusSlides(); // Create previous and next buttons on modal
      }

      // Click event on photos.
      for (
        let i = 0;
        i < (data.photo.length > 4000 ? 4000 : data.photo.length); // 4000 or data.photo.length.
        i++
      ) {
        document
          .querySelector(`.img-wrapp-${i + 1}`)
          .addEventListener("click", function() {
            openModal(); // Open modal.
            currentSlide(i + 1); // Show current slide.
          });
      }
    }
  } catch (error) {
    console.error("Error: ", error); // This code is executed if there is an error, for example that the server does not respond.
  }
}

// Handles clicks on page numbers
async function onPageLinkClick(page) {
  currentPage = page; // Change current page number.
  data = await getPhotos(text.value, perPage.value); // Save current JSON body content with new current page number.

  // Get photos and page number.
  updateUI(data);
  getPageNum(data);
}

// Set img url and create photo elements.
function imgUrl(data, size, i) {
  return `<div class="img-wrapp img-wrapp-${i + 1}"><img src='https://farm${
    data.photo[i].farm
  }.staticflickr.com/${data.photo[i].server}/${data.photo[i].id}_${
    data.photo[i].secret
  }_${size}.jpg' alt="${
    data.photo[i].title
  }"/><div class="img-wrapp_p-wrapp"><p class="img-wrapp_p-wrapp_p font-14">${
    data.photo[i].title
  }</p></div></div>`;
}

// Set large img url and create photo elements for modal.
function largeImgUrl(data, size, i) {
  let selectValue = select.options[select.selectedIndex].value;
  return `<div class="slides"><div class="numbertext">${i +
    1 +
    (data.page * selectValue - selectValue)}/${
    data.total > 4000 ? 4000 : data.total // 4000 / perPage or total page number.
  }</div><img src='https://farm${data.photo[i].farm}.staticflickr.com/${
    data.photo[i].server
  }/${data.photo[i].id}_${data.photo[i].secret}_${size}.jpg' alt="${
    data.photo[i].title
  }"/><div class='title-container'><p id="title"></p></div></div>`;
}

// Create previous and next buttons on modal
function addPlusSlides() {
  return `<a class='prev' onclick='plusSlides(-1)'>&laquo; Previous</a><a class='next' onclick='plusSlides(1)'>Next &raquo;</a>`;
}

// Open the Modal
function openModal() {
  // CSS animation
  document.querySelector(".modal").style.transform = "scale(1)";
  document.querySelector(".modal").style.opacity = "1";
}

// Close the Modal
function closeModal() {
  // CSS animation
  document.querySelector(".modal").style.transform = "scale(0)";
  document.querySelector(".modal").style.opacity = "0";
}

// Handles increment/decrement of images in modal
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Current slide controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

// Show slides
async function showSlides(n) {
  var i;
  var slides = document.querySelectorAll(".slides"); // All wrapping slide div elements.
  var slideImg = document.querySelectorAll(".slides > img"); // All img elements inside the above wrapping div elements.
  var titleText = document.querySelectorAll("#title"); // The title of each image.

  // When the next button of the last image on the last page is clicked in modal view go to first page.
  if (n > slides.length && currentPage === totalPages) {
    currentPage = 1;
    await onPageLinkClick(currentPage); // Get current page number and photos.
    slides = document.querySelectorAll(".slides");
    slideImg = document.querySelectorAll(".slides > img");
    titleText = document.querySelectorAll("#title");
    slideIndex = 1;

    // When the next button of the last image on the current page is clicked go to next page
  } else if (n > slides.length) {
    currentPage = currentPage + 1;
    await onPageLinkClick(currentPage); // Get current page number and photos.
    slides = document.querySelectorAll(".slides");
    slideImg = document.querySelectorAll(".slides > img");
    titleText = document.querySelectorAll("#title");
    slideIndex = 1;
  }

  // When the previous button of the first image on the first page is clicked in modal view go to last page
  if (n < 1) {
    currentPage = currentPage === 1 ? totalPages : currentPage - 1;
    await onPageLinkClick(currentPage); // Get current page number and photos.
    slides = document.querySelectorAll(".slides");
    slideImg = document.querySelectorAll(".slides > img");
    titleText = document.querySelectorAll("#title");
    slideIndex = slides.length;
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none"; // Set display:none on all slides on modal.
  }
  slides[slideIndex - 1].style.display = "block"; // Set display:block on current slide on modal.
  titleText[slideIndex - 1].innerHTML = slideImg[slideIndex - 1].alt; // Set title of the current slide.
}

// Get page number.
function getPageNum(data) {
  resultNum.textContent = ""; // Clear photo number.
  pageNum.textContent = ""; // Clear page number.

  // If there is a search text.
  if (text.value !== "") {
    try {
      resultNum.textContent =
        "Search results : " + (data.total > 4000 ? 4000 + " +" : data.total); //Set search results number.

      // Get total page number.
      totalPages =
        perPage.value * data.pages > 4000 ? 4000 / perPage.value : data.pages; //4000 / perPage or data.pages.

      // If current page is not 1, set "Previous".
      if (currentPage !== 1) {
        pageNum.innerHTML += `<a id="page-${currentPage -
          1}" href="javascript:void(0);" onclick="onPageLinkClick(${currentPage -
          1})";>Previous</a>`;
      }
      switch (true) {
        // 12345
        case currentPage <= 4 && totalPages <= 5:
          for (let i = 1; i <= totalPages; i++) {
            pageNum.innerHTML += `<a id="page-${i}" href="javascript:void(0);" onclick="onPageLinkClick(${i})";>${i}</a>`;
          }
          break;

        // 12345...200
        case currentPage <= 4 && totalPages > 5:
          for (let i = 1; i <= 5; i++) {
            pageNum.innerHTML += `<a id="page-${i}" href="javascript:void(0);" onclick="onPageLinkClick(${i})";>${i}</a>`;
          }
          pageNum.innerHTML += `<span>...</span>`;
          pageNum.innerHTML += `<a id="page-${totalPages}" href="javascript:void(0);" onclick="onPageLinkClick(${totalPages})";>${totalPages}</a>`;
          break;

        // 1...34567...200
        case currentPage > 4 && currentPage <= totalPages - 4:
          pageNum.innerHTML += `<a id="page-${1}" href="javascript:void(0);" onclick="onPageLinkClick(${1})";>${1}</a>`;
          pageNum.innerHTML += `<span>...</span>`;
          for (let i = currentPage; i < currentPage + 5; i++) {
            pageNum.innerHTML += `<a id="page-${i -
              2}" href="javascript:void(0);" onclick="onPageLinkClick(${i -
              2})";>${i - 2}</a>`;
          }
          pageNum.innerHTML += `<span>...</span>`;
          pageNum.innerHTML += `<a id="page-${totalPages}" href="javascript:void(0);" onclick="onPageLinkClick(${totalPages})";>${totalPages}</a>`;
          break;

        // 1...196 197 198 199 200
        case currentPage > 4 && currentPage > totalPages - 4:
          pageNum.innerHTML += `<a id="page-${1}" href="javascript:void(0);" onclick="onPageLinkClick(${1})";>${1}</a>`;
          pageNum.innerHTML += `<span>...</span>`;
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pageNum.innerHTML += `<a id="page-${i}" href="javascript:void(0);" onclick="onPageLinkClick(${i})";>${i}</a>`;
          }
          break;
      }
      // If current page is not equals to total page number, set "Next".
      if (currentPage !== totalPages) {
        pageNum.innerHTML += `<a id="page-${currentPage +
          1}" href="javascript:void(0);" onclick="onPageLinkClick(${currentPage +
          1})";>Next</a>`;
      }

      // Media query
      var x = window.matchMedia("(max-width: 480px)");
      changeFontSize(x); // Call listener function at run time
      x.addListener(changeFontSize); // Attach listener function on state changes
    } catch (error) {
      console.error(error); // This code is executed if there is an error, for example that the server does not respond.
    }
  }
}

// Media query function
function changeFontSize(x) {
  if (x.matches) {
    // If media query matches
    document.querySelector(`#page-${currentPage}`).style.fontSize = "16px";
  } else {
    document.querySelector(`#page-${currentPage}`).style.fontSize = "32px";
  }
}
