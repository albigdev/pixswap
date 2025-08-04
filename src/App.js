import { useEffect, useRef, useState } from "react";
import nintendoLogo from "./nintendo.png";
import logo from "./logo.png";

/**
 * The initial state that contains 3 dummy users, all have game collections
 * All games have individual IDs and they are categorized by platforms.
 * All games have playing status, swapped status, original owner
 */
const initialData = [
  {
    username: "user1",
    password: "password1",
    games: [
      {
        id: crypto.randomUUID(),
        picture:
          "https://cdn2.unrealengine.com/Diesel%2Fproductv2%2Fdeath-stranding%2Fhome%2FEGS_KojimaProductions_DeathStranding_S1-2560x1440-d57b8f430c573292ea8450e5be7f75a4b4e3f015.jpg",
        name: "Death Standing",
        gameType: "playstation",
        playing: false,
        swapped: false,
        originalOwner: "",
        openSwap: false,
      },
      {
        id: crypto.randomUUID(),
        picture: "https://i.ytimg.com/vi/6cs-A1rNvEE/maxresdefault.jpg",
        name: "Death Standing 2",
        gameType: "playstation",
        playing: false,
        swapped: false,
        originalOwner: "",
        openSwap: false,
      },
      {
        id: crypto.randomUUID(),
        picture:
          "https://gaming-cdn.com/images/products/2616/orig/the-legend-of-zelda-breath-of-the-wild-switch-game-nintendo-eshop-europe-cover.jpg?v=1730381682",
        name: "Zelda Breath of the Wild",
        gameType: "nintendo",
        playing: false,
        swapped: false,
        originalOwner: "",
        openSwap: false,
      },
      {
        id: crypto.randomUUID(),
        picture:
          "https://cms-assets.xboxservices.com/assets/a0/26/a0261fcf-e92f-48d6-83a1-9f4424a7c1b6.jpg?n=467176942_GLP-Page-Hero-1084_1920x1080_03.jpg",
        name: "Sea of Thieves",
        gameType: "xbox",
        playing: false,
        swapped: false,
        originalOwner: "",
        openSwap: false,
      },
    ],
  },
  {
    username: "user2",
    password: "password2",
    games: [
      {
        id: crypto.randomUUID(),
        picture:
          "https://ac-pocketcamp.com/official_fb_share_en-US.jpg?20241128",
        name: "Animal Crossing",
        gameType: "nintendo",
        playing: false,
        swapped: false,
        originalOwner: "",
        openSwap: false,
      },
    ],
  },
  {
    username: "user3",
    password: "password3",
    games: [
      {
        id: crypto.randomUUID(),
        picture:
          "https://ac-pocketcamp.com/official_fb_share_en-US.jpg?20241128",
        name: "Animal Crossing",
        gameType: "nintendo",
        playing: false,
        swapped: false,
        originalOwner: "",
        openSwap: false,
      },
    ],
  },
];

/**
 * This is a custom hook to return initial state or local storage data if exists
 * @param {Object} initialState - The initial data for the app
 * @param {Array} key - The key name for the local storage
 * @returns The local storage value or the initial state
 */
function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialState;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}

/**
 * The timer to track inactivity and initiate action after timer ends
 * @param {Function} onLogout - Callback function for the action when timer ends
 * @param {Boolean} start - Boolean value to start the timer conditionally
 * @returns The remaining time (remaining state)
 * Note: I needed to add isLoggedout to avoid running onLogout twice (alert in callback)
 */
function useAutoLogOutWithTimer(onLogout, start) {
  const interval = useRef(null);
  const isLoggedOut = useRef(false);
  const timeout = 3 * 60 * 1000;
  const [remaining, setRemaining] = useState(timeout);

  useEffect(() => {
    const resetTimer = () => {
      setRemaining(timeout);
    };

    window.addEventListener("click", resetTimer);

    if (start) {
      interval.current = setInterval(() => {
        setRemaining((prevRemaining) => {
          if (prevRemaining <= 0) {
            if (!isLoggedOut.current) {
              onLogout();
              clearInterval(interval.current);
              isLoggedOut.current = true;
            }
            return 0;
          }
          return prevRemaining - 1000;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval.current);
      window.removeEventListener("click", resetTimer);
      isLoggedOut.current = false;
    };
  }, [onLogout, start, timeout]);

  return Math.floor(remaining / 1000);
}

/**
 * State handlers:
 * -loggedIn: for traccking the login status
 * -startlogin: for tracking when the user clicks on the login button
 * -curUser: is the actual user
 * -userData: initial data with all users and games and then we keep this updated for later logins
 * -gameToSwap: the game we will swap with other users
 * -keyword: the keyword to search games with the search field
 * -openAddGameForm: to keep track if the Add game button was clicked
 * -sortBy: for sorting the game list
 * @returns All componnents in the App
 */
function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [startLogin, setStartLogin] = useState(false);
  const [curUser, setCurUser] = useState(null);
  const [userData, setUserData] = useLocalStorageState(initialData, "userData");
  const [gameToSwap, setGameToSwap] = useState("");
  const [keyword, setKeyWord] = useState("");
  const [openAddGameForm, setOpenAddGameForm] = useState(false);
  const [sortBy, setSortBy] = useState("input");

  const secondsLeft = useAutoLogOutWithTimer(() => {
    setCurUser(null);
    setLoggedIn(false);
    setStartLogin(false);
    alert("You have been logged out due to inactivity.");
  }, loggedIn);

  /**
   * It handles the game list sorting
   * Options: input 'no order', 'name', 'swapped', 'playing', 'platform'
   * @param {Array} games - The game list
   * @returns - The ordered game list
   */
  function addFilter(games) {
    switch (sortBy) {
      case "input":
        return games;
      case "name":
        return games.sort((a, b) => a.name.localeCompare(b.name));
      case "swapped":
        return games.sort((a, b) => Number(a.swapped) - Number(b.swapped));
      case "playing":
        return games.sort((a, b) => Number(b.playing) - Number(a.playing));
      case "platform":
        return games.sort((a, b) => a.gameType.localeCompare(b.gameType));

      default:
        return games;
    }
  }

  const filteredGames = curUser?.games.filter((game) =>
    game.name.toLowerCase().includes(keyword.toLowerCase())
  );

  const gamesToShow = curUser ? addFilter(filteredGames) : null;

  /**
   *This function updates the current user data and the global 'userData' list
   * @param {Object} updatedUser - The updated user
   */
  function updateUserData(updatedUser) {
    setCurUser(updatedUser);
    setUserData((data) =>
      data.map((user) =>
        user.username === updatedUser.username ? updatedUser : user
      )
    );
  }

  /**
   * It handles the playing status of the selected game
   * @param {Object} curGame - The selected game
   */
  function handlePlayingStatus(curGame) {
    let confirmed;

    if (curGame.playing === false) {
      confirmed = window.confirm(
        "If you are playing a game, you cannot swap it. Do you continue?"
      );
    } else confirmed = true;

    if (confirmed) {
      const updatedGames = curUser.games.map((game) =>
        game.id === curGame.id
          ? { ...game, playing: !game.playing, openSwap: false }
          : { ...game, openSwap: false }
      );

      const updatedUser = { ...curUser, games: updatedGames };
      updateUserData(updatedUser);
    }
  }

  /**
   * It handles the removal of the selected game
   * @param {Object} curGame - The selected game
   */
  function handleRemoval(curGame) {
    const confirmed = window.confirm(
      "Are you sure that you want to delete this game from your collection?"
    );

    if (confirmed) {
      const updatedGames = curUser.games
        .filter((game) => game.id !== curGame.id)
        .map((games) => ({ ...games, openSwap: false }));

      const updatedUser = { ...curUser, games: updatedGames };
      updateUserData(updatedUser);
    }
  }

  /**
   * It opens/closes the swap menu of the selected game
   * @param {Object} curGame - The selected game
   */
  function handleSwapMenu(curGame) {
    const updatedGames = curUser.games.map((game) =>
      game.id === curGame.id
        ? { ...game, openSwap: !game.openSwap }
        : { ...game, openSwap: false }
    );
    const updatedUser = { ...curUser, games: updatedGames };
    setCurUser(updatedUser);
    setGameToSwap(curGame);
  }

  /**
   * It starts the swap between two users
   * If the game is swapped, it will return to the original user (the game will be removed from the current user)
   * If not, it will be copied to the selected user and the original remains with the current user
   * @param {string} selectedUser - The username of the selected user
   */
  function handleSwapGame(selectedUser) {
    const confirmed = window.confirm(
      `Are you sure that you want to swap this game with ${selectedUser}?`
    );

    if (confirmed) {
      function updateGameForSwap(game, curUser, selectedUser) {
        const willBeSwapped = !game.swapped;

        return {
          ...game,
          swapped: willBeSwapped,
          originalOwner: willBeSwapped ? curUser.username : "",
          swappedWith: willBeSwapped ? selectedUser : "",
          openSwap: false,
        };
      }

      const isSwapped = gameToSwap.swapped;
      const secondUser = userData.find(
        (user) => user.username === selectedUser
      );

      if (isSwapped) {
        const returnedGame = updateGameForSwap(
          gameToSwap,
          curUser,
          selectedUser
        );

        const updateCurUserGames = curUser.games.filter(
          (game) => game.id !== returnedGame.id
        );

        const updatedCurUser = { ...curUser, games: updateCurUserGames };

        const updatedSecondUserGames = secondUser.games.map((game) =>
          game.id === returnedGame.id ? returnedGame : game
        );

        const updatedSecondUser = {
          ...secondUser,
          games: updatedSecondUserGames,
        };

        //Update both users
        setCurUser(updatedCurUser);
        setUserData((data) =>
          data.map((user) => {
            if (user.username === updatedCurUser.username)
              return updatedCurUser;
            if (user.username === updatedSecondUser.username)
              return updatedSecondUser;
            return user;
          })
        );
      } else {
        const copiedGame = updateGameForSwap(gameToSwap, curUser, selectedUser);

        const updateCurUserGames = curUser.games.map((game) =>
          game.id === copiedGame.id ? copiedGame : game
        );

        const updatedCurUser = { ...curUser, games: updateCurUserGames };

        const updatedSecondUser = {
          ...secondUser,
          games: [...secondUser.games, copiedGame],
        };

        setCurUser(updatedCurUser);
        setUserData((data) =>
          data.map((user) => {
            if (user.username === updatedCurUser.username)
              return updatedCurUser;
            if (user.username === updatedSecondUser.username)
              return updatedSecondUser;
            return user;
          })
        );
      }
    }
  }

  /**
   * It sets the keyword for the search
   * @param {string} keyword - The keyword for search
   */
  function handleSearch(keyword) {
    setKeyWord(keyword);
  }

  /**
   * It handles the game from opening (modal window)
   */
  function handleOpenAddGameForm() {
    setOpenAddGameForm(!openAddGameForm);
  }

  /**
   * It renders the game card for each games
   * @param {Object} game - the game object for all games in the array
   * @returns The game card and the swap function
   */
  function renderGameCard(game) {
    return (
      <GameCard
        key={game.id}
        game={game}
        onHandlePlayingStatus={handlePlayingStatus}
        onHandleRemoval={handleRemoval}
        onHandleSwapMenu={handleSwapMenu}
        curUser={curUser}
      >
        <SwapGame
          userData={userData}
          curUser={curUser}
          onSwapGame={handleSwapGame}
          gameToSwap={gameToSwap}
        />
      </GameCard>
    );
  }

  return (
    <div className="App">
      <NavPanel>
        <Logo />
        {loggedIn && <Search onSearch={handleSearch} />}
        <UserMenu
          isLoginPanelOpen={startLogin}
          setLoginPanelOpen={setStartLogin}
          onLoggedIn={loggedIn}
          onSetLoggedIn={setLoggedIn}
          curUser={curUser}
          setCurUser={setCurUser}
          onOpenAddGameForm={handleOpenAddGameForm}
          secondsLeft={secondsLeft}
        />
      </NavPanel>
      {loggedIn ? <Stats curUser={curUser} /> : ""}
      <Main onLoggedIn={loggedIn} isLoginPanelOpen={startLogin}>
        <AddGameForm
          key={openAddGameForm}
          openAddGameForm={openAddGameForm}
          onOpenAddGameForm={handleOpenAddGameForm}
          curUser={curUser}
          updateUserData={updateUserData}
          setOpenAddGameForm={setOpenAddGameForm}
        />
        {!loggedIn && !startLogin && <Welcome />}
        {!loggedIn && startLogin && (
          <LoginPanel
            onSetLoggedIn={setLoggedIn}
            curUser={curUser}
            setCurUser={setCurUser}
            userData={userData}
          />
        )}
        {loggedIn && (
          <>
            {gamesToShow.length > 0 ? (
              gamesToShow.map(renderGameCard)
            ) : (
              <div className="no-results">No results</div>
            )}
          </>
        )}
      </Main>
      {loggedIn && <Sort sortBy={sortBy} setSortBy={setSortBy} />}
    </div>
  );
}

/**
 * This is a wrapper component for the nav bar
 * @param {Object} props - The props for this comp
 * @returns {JSX.Element} The HTML elements in the nav bar
 */
function NavPanel({ children }) {
  return <nav className="nav-panel">{children}</nav>;
}

/**
 * It showes the statistics for the current user:
 * -All games
 * -Played games
 * -Sent games
 * -Received games
 * -Percentage of own games
 * -Percentage of borrowed games
 * @param {Object} props - The props for this component
 * @param {Object} props.curGame - The current user
 * @returns {JSX.Element} - The statistics panel
 */
function Stats({ curUser }) {
  return (
    <nav className="stats-panel">
      <div className="stats">
        <div>
          Games: <span>{curUser.games.length}</span>
        </div>
        <div>
          Playing:{" "}
          <span>
            {curUser.games.filter((games) => games.playing === true).length}
          </span>
        </div>
        <div>
          Sent:{" "}
          <span>
            {
              curUser.games.filter(
                (games) =>
                  games.swapped === true &&
                  games.originalOwner === curUser.username
              ).length
            }
          </span>
        </div>
        <div>
          Received:{" "}
          <span>
            {
              curUser.games.filter(
                (games) =>
                  games.swapped === true &&
                  games.originalOwner !== curUser.username
              ).length
            }
          </span>
        </div>
        <div>
          Own:{" "}
          <span>
            {Math.round(
              (curUser.games.filter(
                (games) =>
                  games.originalOwner === "" ||
                  games.originalOwner === curUser.username
              ).length /
                curUser.games.map((games) => games).length) *
                100
            )}
            %
          </span>
        </div>
        <div>
          Borrowed:{" "}
          <span>
            {Math.round(
              (curUser.games.filter(
                (games) =>
                  games.originalOwner !== curUser.username &&
                  games.originalOwner !== ""
              ).length /
                curUser.games.map((games) => games).length) *
                100
            )}
            %
          </span>
        </div>
      </div>
    </nav>
  );
}

/**
 * It shows the logo
 * @returns {JSX.Element} - The logo div
 */
function Logo() {
  return (
    <div className="logo">
      <img src={logo} alt="logo" />
    </div>
  );
}

/**
 * Seaarch component the uses a keyword
 * @param {Object} props - The props for the component
 * @param {function} props.onSearch - Callback that runs when we use the search field
 * @returns {JSX.Element} - Input field for search
 */
function Search({ onSearch }) {
  return (
    <input
      className="search-bar"
      type="text"
      placeholder="Game title"
      onChange={(e) => onSearch(e.target.value)}
    ></input>
  );
}

/**
 * This is the UserMenu panel
 * When the user is not logged in, the button shows "Login"
 * When the user is logged in, it shows the username and the log off option and the add game button
 * @param {Object} props - The props for the component
 * @param {boolean} props.isLoginPanelOpen - Is the login panel open?
 * @param {function} props.setLoginPanelOpen - Sets the login panel status
 * @param {boolean} props.onLoggedIn - The status of the login
 * @param {Object|null} props.curUser - The current user
 * @param {function} props.setCurUser - Changes the current user
 * @param {function} props.onSetLoggedIn - Changes the LoggedIn status
 * @param {function} props.onOpenAddGameForm - Open the modal window for adding a new game
 * @param {function} secondsLeft - The timer from the App component which triggers logout
 * @returns {JSX.Element} Based on conditions - Login/Log off buttons, username and Add game button
 */
function UserMenu({
  isLoginPanelOpen,
  setLoginPanelOpen,
  onLoggedIn,
  curUser,
  setCurUser,
  onSetLoggedIn,
  onOpenAddGameForm,
  secondsLeft,
}) {
  function handleStartLogin() {
    setLoginPanelOpen(!isLoginPanelOpen);
  }

  function handleLogOff() {
    setCurUser(null);
    onSetLoggedIn(false);
    setLoginPanelOpen(false);
  }

  return (
    <div className="right-menu">
      {curUser && <AddGameButton onOpenAddGameForm={onOpenAddGameForm} />}
      <div className="login">
        {onLoggedIn ? (
          <>
            <h1>{curUser?.username}</h1>
            {/* <p>&#124;</p> */}
            <p role="button" onClick={handleLogOff}>
              Log off &bull; {Math.floor(secondsLeft / 60)}:
              {(secondsLeft % 60).toString().padStart(2, "0")}
            </p>
          </>
        ) : (
          <>
            <h1 role="button" onClick={handleStartLogin}>
              Login
            </h1>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * It opens the add game form
 * @param {Object} props - The props for this component
 * @param {function} props.onOpenAddGameForm - Sets the modal windows status for the add game form
 * @returns {JSX.Element} - Add game button
 */
function AddGameButton({ onOpenAddGameForm }) {
  return <button onClick={onOpenAddGameForm}>Add game</button>;
}

/**
 * This is to add a new game to the current user
 * @param {Object} props - This is the props for component
 * @param {boolean} props.openAddGameForm - The status of the add game form modal window
 * @param {Object} props.curUser - This is the current user object
 * @param {function} props.onOpenAddGameForm - Set the modal windows status for adding a new game
 * @param {function} props.setOpenAddGameForm - Sets open/closed for the add new game modal windows
 * @param {function} props.updateUserData - Function to update the user data, receives user object
 * @returns {JSX.Element} - The add new game form in modal window
 */
function AddGameForm({
  openAddGameForm,
  onOpenAddGameForm,
  curUser,
  updateUserData,
  setOpenAddGameForm,
}) {
  const [gameTitle, setGameTitle] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [platform, setPlatform] = useState("playstation");

  const newGame = {
    id: crypto.randomUUID(),
    picture: imgUrl,
    name: gameTitle,
    gameType: platform,
    playing: false,
    swapped: false,
    originalOwner: "",
    openSwap: false,
  };

  if (!curUser) return;

  const updatedCurUser = { ...curUser, games: [...curUser?.games, newGame] };

  function handleSubmit(e) {
    e.preventDefault();

    updateUserData(updatedCurUser);
    setOpenAddGameForm(false);
    setGameTitle("");
    setImgUrl("");
  }

  return (
    <div
      onClick={onOpenAddGameForm}
      className={`modal-overlay ${openAddGameForm ? `active` : ``}`}
    >
      <div onClick={(e) => e.stopPropagation()} className="add-game-form">
        <button onClick={onOpenAddGameForm} className="modal-btn">
          <ion-icon name="close-outline"></ion-icon>
        </button>
        <h1>Add a new game</h1>
        <form onSubmit={handleSubmit}>
          <p>Title</p>
          <input
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            placeholder="Title"
            type="text"
            required
          ></input>
          <p>Cover image url</p>
          <input
            value={imgUrl}
            onChange={(e) => setImgUrl(e.target.value)}
            placeholder="Cover image url"
            type="text"
          ></input>
          <p>Platform</p>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value.toLowerCase())}
          >
            <option value="playstation">Playstation</option>
            <option value="nintendo">Nintendo</option>
            <option value="xbox">Xbox</option>
          </select>
          <button>Add game</button>
        </form>
      </div>
    </div>
  );
}

/**
 * The login form
 * @param {Object} props - Props for this component
 * @param {function} props.onSetLoggedIn - Sets the login status true/false
 * @param {function} props.setCurUser - Sets the current user
 * @param {Object} props.userData - The initial for the first login/updated user data for later logins
 * @returns {JSX.Element} The login for input fields
 */
function LoginPanel({ onSetLoggedIn, setCurUser, userData }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();

    const user = userData.find(
      (user) => user.username === username && user.password === password
    );

    if (user) {
      onSetLoggedIn(true);
      setCurUser(user);
    } else alert("Wrong username or password");
  }

  return (
    <div className="login-panel">
      <form className="login-form" value="" onSubmit={handleSubmit}>
        <p>Username</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        ></input>
        <p>Password</p>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <button>Login</button>
      </form>
    </div>
  );
}

/**
 * The main component (Conditional rendering):
 * -Welcome
 * -Login panel
 * -Add game form
 * -Game cards
 * @param {Object} props - The props for this component
 * @param {boolean} props.onLoggedIn - Login status false/true
 * @param {boolean} props.isLoginPanelOpen - The status of the login panel
 * @param {React.ReactNode} props.children - Components: Welcome, AddGameForm, LoginPanel, GameCard
 * @returns {JSX.Element} - Returns the children
 */
function Main({ children, onLoggedIn, isLoginPanelOpen }) {
  return (
    <main
      className={onLoggedIn ? "main" : isLoginPanelOpen ? "main" : "main-start"}
    >
      {children}
    </main>
  );
}

/**
 * The drop down menu to sort the game list
 * @param {Object} props - The props for this component
 * @param {string} props.sortBy - The criteria for sorting
 * @param {function} props.setSortBy - Callback to set sorting criteria
 * @returns {JSX.Element} - The drop down menu
 */
function Sort({ sortBy, setSortBy }) {
  return (
    <div className="sort-panel">
      <p>Sort by</p>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value.toLowerCase())}
      >
        <option value="input">Input</option>
        <option value="name">Name</option>
        <option value="platform">Platform</option>
        <option value="swapped">Swapped</option>
        <option value="playing">Playing</option>
      </select>
    </div>
  );
}

/**
 * The Welcome page
 * @returns {JSX.Element} - The welcome text
 */
function Welcome() {
  return (
    <div className="welcome">
      <p>Start the adventure, swap games, share moments...</p>
    </div>
  );
}

/**
 * This is the card component for each games
 * It shows the image, the bar with the button, title, platform and the switch menu
 * Game bar buttons:
 * -Playing
 * -Removal
 * -Swap
 * Shows if the game is swapped (and also the original user)
 * If the swap menu is open (game.openSwap), shows the SwapGame component (children)
 * @param {Object} props - The props for this component
 * @param {Object} props.game - The game object that the card shows
 * @param {function} prop.onHandlePlayingStatus - Callback to set the playing status on games
 * @param {function} props.onHandleRemoval - Callback to remove a game
 * @param {function} props.onHandleSwapMenu - Callback to open/close Swap menu
 * @param {Object} props.curUser - The actual user
 * @param {React.ReactNode} props.children - The children components: SwapGame if openSwap=true
 * @param {Object} props - The props for this component
 * @returns {JSX.Element} - The Game cards
 */
function GameCard({
  children,
  game,
  onHandlePlayingStatus,
  onHandleRemoval,
  onHandleSwapMenu,
  curUser,
}) {
  return (
    <div
      className={`box ${game.gameType} ${
        game.swapped && game.originalOwner === curUser.username ? "swapped" : ""
      }`}
    >
      <div className="box-img-container">
        <img
          src={
            game.picture || `https://placehold.co/690x360/?text=${game.name}`
          }
          alt={game.name}
          className={
            game.swapped && game.originalOwner === curUser.username
              ? "box-img-swapped"
              : ""
          }
        />
        <div className="box-img-overlay"></div>
      </div>
      {game.swapped && game.originalOwner !== curUser.username ? (
        <div className="gamecard-bar">Received from {game.originalOwner}</div>
      ) : (
        ""
      )}
      <div className="gamecard-bar">
        {game.swapped && game.originalOwner === curUser.username ? (
          `Swapped with ${game.swappedWith}`
        ) : (
          <>
            <button
              className="gamecard-bar-btn"
              onClick={() => onHandlePlayingStatus(game)}
            >
              {game.playing ? (
                <ion-icon name="game-controller"></ion-icon>
              ) : (
                <ion-icon name="game-controller-outline"></ion-icon>
              )}
            </button>
            {game.swapped ? (
              ""
            ) : (
              <button
                className="gamecard-bar-btn"
                onClick={() => onHandleRemoval(game)}
              >
                <ion-icon name="close"></ion-icon>
              </button>
            )}
            {game.playing ? (
              <button className="gamecard-bar-btn-disabled">
                <ion-icon name="sync"></ion-icon>
              </button>
            ) : (
              <button
                className="gamecard-bar-btn"
                onClick={() => onHandleSwapMenu(game)}
              >
                <ion-icon name="sync"></ion-icon>
              </button>
            )}
          </>
        )}
      </div>
      <div className="gamecard-info">
        <h2 className={game.name.length > 20 ? "short-title" : ""}>
          {game.name}
        </h2>
        {/* <p>{game.description}</p> */}
        <span>
          Platform:{" "}
          {game.gameType === "playstation" ? (
            <ion-icon
              className="platform-icons"
              name="logo-playstation"
            ></ion-icon>
          ) : game.gameType === "xbox" ? (
            <ion-icon className="platform-icons" name="logo-xbox"></ion-icon>
          ) : game.gameType === "nintendo" ? (
            <img src={nintendoLogo} className="logo-nintendo" alt="nintendo" />
          ) : (
            ""
          )}
        </span>
      </div>
      {game.openSwap && children}
    </div>
  );
}

/**
 * This is the component to handle swap games between users
 * Drop down menu for games to select user
 * If swapped === true, only original owner appears
 * On submit form calls the onSwapgame callback with the selected user
 * @param {Object} props - The props for this component
 * @param {Array} props.userData - It gives the user data (all users)
 * @param {Object} props.curUser - The current user
 * @param {function} props.onSwapGame - The callback that starts the swap logic
 * @param {Object} props.gameToSwap - The selected game for swap
 * @returns {JSX.Element} - Shows the swap drop down for games
 */
function SwapGame({ userData, curUser, onSwapGame, gameToSwap }) {
  const [selectedUser, setSelectedUser] = useState(() => {
    const filteredUser = userData.filter(
      (user) => user.username !== curUser.username
    );
    return filteredUser[0].username;
  });

  return (
    <form
      className="switch-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (selectedUser) onSwapGame(selectedUser);
      }}
    >
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        {gameToSwap.swapped ? (
          <option
            key={gameToSwap.originalOwner}
            value={gameToSwap.originalOwner}
          >
            {gameToSwap.originalOwner}
          </option>
        ) : (
          userData
            .filter((user) => user.username !== curUser.username)
            .map((user) => (
              <option key={user.username} value={user.username}>
                {user.username}
              </option>
            ))
        )}
      </select>
      <button className="switch-btn">
        <ion-icon name="send-outline"></ion-icon>
      </button>
    </form>
  );
}

export default App;
