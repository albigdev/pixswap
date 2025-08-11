# Pixswap - Swap your games with friends and keep track of them

- Pixswap is a React based (learning) project where users can swap games with each other
- You can test all functions on https://pixswapgames.netlify.app/

# 🚀 Functions

- 👤 Login function with 3 pre-defined users
- 🎮 Add new game to the game collection with API (RAWG Games)
- 🕹️ Handling of the gaming status: **playing**, **swapped**, **originalOwner**
- 🔍 Search games based on title
- 🔄 Swap games with other users
- 📊 Stats: all games, played games, sent, received, owned%, borrowed%
- ⏱️ Automatic sign off after 3 minutes inactivity
- 📁 Storing data in the browser's LocalStorage
- 🔽 Sort games: input, name, platform, swapped status, playing status

# 🛠️ Technology

- React (Functional Components + Hooks (useState, useEffect, useRef, useReducer custom hooks))
- JavaScript
- CSS
- LocalStorage
- RAWG.IO API for game database

# 🧩 Main Components

- App (Main component for rendering and handle states)
- GameCard (Showing game cards for each game)
- SwapGame (This is the component to handle swap games between users)
- AddGameForm (Add new game with API call from https://rawg.io/apidocs)

# 👥 Users for testing

- user1 password1
- user2 password2
- user3 password3

# ✅ ToDo

- Option to create new user (Register)
- Backend integration (own API)
- Responsive design (mobile, tablet, smaller screens)

# 🙌 Acknowledgments

- I learned Javascript and React from Jonas Schmedtmann (web developer, designer and teacher) I owe it to him that I learned these things, I recommend him to everyone, he is an excellent teacher.
