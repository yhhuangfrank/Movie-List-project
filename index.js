// *將重複性高的網址定義好參數方便後續維護
const BASE_URL = "https://movie-list.alphacamp.io/";
const INDEX_URL = BASE_URL + "api/v1/movies/";
// *處理圖片檔案專用連結，方便後續串接filename
const POSTER_URL = BASE_URL + "posters/";

// *存放電影的容器
const movies = [];
let movieFiltered = [];
// *抓出data-panelDOM元素
const dataPanel = document.querySelector("#data-panel");
// *抓出search form
const searchForm = document.querySelector("#search-form");
// *search form 的 input
const input = document.querySelector("#search-input");
// -定義分頁所顯示電影數量
const MOVIES_PER_PAGE = 12;
const pagination = document.querySelector(".pagination");
//- 定義初始currentPage為1
let currentPage = 1;
const cardBtn = document.querySelector("#btn-card-ver");
const listBtn = document.querySelector("#btn-list-ver");
//- 設定清單模式預設值
let isListVer = false;

// *使用函式賦予dataPenel資料
function renderMoiveList(data) {
  let HTMLcontent = "";
  // *需要movies的資訊為title, image
  data.forEach((item) => {
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
                <button class="btn btn-info btn-add-favorite" data-id=${
                  item.id
                }>+</button>
              </div>
            </div>
          </div>
        </div>
  `;
  });
  dataPanel.innerHTML = HTMLcontent;
}



// *設置Modal監聽器(按下More)
dataPanel.addEventListener("click", function movieModal(e) {
  const target = e.target;
  if (target.matches(".btn-show-movie")) {
    // -從HTML上存取data透過htmlElement.dataset.*來取得值
    showMovieModal(Number(target.dataset.id));
  } else if (target.matches(".btn-add-favorite")) {
    addToFavorite(Number(target.dataset.id));
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
                  width="100%"
                />
    `;
    modalDate.textContent = `release date: ${data.release_date}`;
    modalDescription.textContent = data.description;
  });
}

// -收藏功能
// *先將"+"按鈕html上設定dataset綁定完id方便操作
// *在datapanel事件監聽器上綁定一個收藏function addToFavorite
function addToFavorite(id) {
  // *希望從localStorage 取得收藏清單，若裡頭沒有東西則回傳空字串
  const favoriteList = JSON.parse(localStorage.getItem("favorite")) || [];
  // -透過id比對獲得電影相關資訊
  const favoriteMovies = movies.find((movie) => {
    return movie.id === id;
  });
  // -將選擇的電影放入favoritelist裡，但如果裡頭已經有了就不新增
  const isMovieExist = favoriteList.some((movie) => {
    return movie.id === id;
  });
  if (isMovieExist) {
    return alert("此電影已加入收藏");
  } else {
    favoriteList.push(favoriteMovies);
    alert("收藏成功!!");
  }
  // -將新的清單重新傳進localStorage, 並要先轉成JSON字串
  localStorage.setItem("favorite", JSON.stringify(favoriteList));
}

//- 分頁功能
//* 定義透過分頁數字切割movies陣列，再顯示對應內容
function getMoviesByPages(page) {
  //- 額外判斷搜尋清單裡是否有資料(movieFiltered)
  //- 如果有就針對搜尋結果做分頁，如果沒有就取總清單
  const data = movieFiltered.length ? movieFiltered : movies;
  //*起始index與結束index和page關係
  //*page1: 0-11; page2: 12-23...
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  const endIndex = startIndex + MOVIES_PER_PAGE;
  const sliceMoives = data.slice(startIndex, endIndex);
  return sliceMoives;
}

//- 動態產生分頁區塊
function paginator(num) {
  //* 計算總共所需頁數(傳入電影數量)
  const totalPage = Math.ceil(num / MOVIES_PER_PAGE);
  let HTMLcontent = `
        <li class="page-item active"><a class="page-link" data-page=1 href="#">1</a></li>
  `;
  for (let page = 2; page <= totalPage; page += 1) {
    HTMLcontent += `
    <li class="page-item"><a class="page-link" data-page=${page} href="#">${page}</a></li>
    `;
  }
  pagination.innerHTML = HTMLcontent;
}

//! 設置事件
//- 搜尋功能
// *設置search事件(需綁定submit事件)
searchForm.addEventListener("submit", function onSearchButton(e) {
  // *設定submit功能先不要有作用
  e.preventDefault();
  // *定義搜尋關鍵字的變數
  const keyWord = input.value.trim().toLowerCase();

  // *定義過濾關鍵字後的新陣列
  movieFiltered = movies.filter((movie) => {
    return movie.title.trim().toLowerCase().includes(keyWord);
  });

  if (movieFiltered.length === 0) {
    input.value = "";
    return alert(`輸入的關鍵字: ${keyWord}沒有符合條件的電影`);
  }
  //* 如果搜尋結果有內容針對結果重製分頁器
  paginator(movieFiltered.length);
  // *重新渲染過濾後畫面，預設顯示第一頁搜尋頁面
  if (isListVer) {
    toListVersion(getMoviesByPages(1));
  } else {
    renderMoiveList(getMoviesByPages(1));
  }
  input.value = "";
});

//- 分頁事件傳回對應電影
pagination.addEventListener("click", (e) => {
  const target = e.target;
  const targetpage = Number(target.dataset.page);
  const parent = target.parentElement;
  if (isNaN(targetpage)) {
    return;
  } else {
    const children = pagination.children;
    for (const child of children) {
      if (child.classList.contains("active")) {
        child.classList.remove("active");
      }
    }
    parent.classList.add("active");
    //- 確認是否在list顯示模式
    if (isListVer) {
      toListVersion(getMoviesByPages(targetpage));
    } else {
      renderMoiveList(getMoviesByPages(targetpage));
    }
    currentPage = targetpage;
  }
});

//! 額外功能 : 卡片模式與清單模式切換
//- 確認目前所在頁數 -> 執行getMoviesByPages判斷目前應該獲取哪些電影資料 -> 以list或card形式重新渲染畫面
//- 製作可渲染清單樣式按鈕與function
function toListVersion(data) {
  let HTMLcontent = "";
  data.forEach((item) => {
    HTMLcontent += `
              <div class="col col-11 list-version-container border-top  my-2 pt-2">
          <div class="row">
            <section class="col col-8 left">${item.title}</section>
            <section class="col col-4 right text-center">
              <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id=${item.id}
                >
                  More
                </button>
                <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
            </section>
          </div>
        </div>
    `;
  });
  dataPanel.innerHTML = HTMLcontent;
}
//- 卡片與清單模式按鈕事件監聽
listBtn.addEventListener("click", function onListBtn() {
  const getMoives = getMoviesByPages(currentPage);
  toListVersion(getMoives);
  isListVer = true;
  cardBtn.classList.remove("btn-primary");
  listBtn.classList.add("btn-primary");
});

cardBtn.addEventListener("click", function onCardBtn() {
  const getMoives = getMoviesByPages(currentPage);
  renderMoiveList(getMoives);
  isListVer = false;
  listBtn.classList.remove("btn-primary");
  cardBtn.classList.add("btn-primary");
});

//- 向API取得資料，async 函式最後才執行放最下方即可
axios
  .get("https://movie-list.alphacamp.io/api/v1/movies")
  .then((response) => {
    //  *此處不能使用movies = response.data.result，因const 不能重複賦予值，需使用push
    // *使用...(spread operator)展開一一填入movies
    movies.push(...response.data.results);
    // *再使用function 填入dataPanel，要寫在axios裏頭，才能處理資料
    renderMoiveList(getMoviesByPages(1));
    //-動態產生分頁，以電影數量當參數
    paginator(movies.length);
  })
  .catch((err) => {
    console.log(err);
  });