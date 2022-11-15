// *將重複性高的網址定義好參數方便後續維護
const BASE_URL = "https://movie-list.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/v1/movies/";
// *處理圖片檔案專用連結，方便後續串接filename
const POSTER_URL = BASE_URL + "posters/";

// *抓出data-panelDOM元素
const dataPanel = document.querySelector("#data-panel");

// *使用函式賦予dataPenel資料
function loadFavorite() {
  let HTMLcontent = "";
  const favoriteList = JSON.parse(localStorage.getItem("favorite"));
  // *需要movies的資訊為title, image
  favoriteList.forEach((item) => {
    HTMLcontent += `
          <div class="col-sm-3"> 
          <div class="mb-2">
            <div class="card">
              <img
                src=${POSTER_URL + item.image} 
                class="card-img-top"
                alt="..."
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id=${item.id}
                >
                  More
                </button>
                <button class="btn btn-danger btn-delete-favorite" data-id=${
                  item.id
                }>X</button>
              </div>
            </div>
          </div>
        </div>
  `;
  });
  dataPanel.innerHTML = HTMLcontent;
}
loadFavorite();

// *設置Modal監聽器(按下More)
dataPanel.addEventListener("click", function movieModal(e) {
  const target = e.target;
  if (target.matches(".btn-show-movie")) {
    // -從HTML上存取data透過htmlElement.dataset.*來取得值
    showMovieModal(Number(target.dataset.id));
  } else if (target.matches(".btn-delete-favorite")) {
    deleteFavorite(Number(target.dataset.id));
  }
});

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.textContent = data.title;
    modalImage.innerHTML = `
                    <img
                  src=${POSTER_URL + data.image}
                  alt="movie-modal-image"
                />
    `;
    modalDate.textContent = `release date: ${data.release_date}`;
    modalDescription.textContent = data.description;
  });
}

// ! 刪除favorite功能
function deleteFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem("favorite"));
  const newFavoriteList = favoriteList.filter((movie) => {
    return movie.id !== id;
  });
  localStorage.setItem("favorite", JSON.stringify(newFavoriteList));
  loadFavorite();
}
