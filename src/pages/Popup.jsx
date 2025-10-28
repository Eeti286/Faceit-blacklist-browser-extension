import { Storage } from '../shared/storage';
import "./popupStyle.css";
import { useEffect, useState } from "react";


export function PlayerList({ type }) {
  const [itemList, setItemList] = useState([]);
  const [imgDict, setImgDict] = useState({})
  const placeholdeImgPath = "../img/placeholder-image.png"

  const updateList = (changes) => {
      const name = Object.keys(changes)[0];
      setItemList(itemList.filter(item => item !== name));
  }

  const removeItem = async (item) => {
    await Storage.remove(item)
  }

  const addImage = (id, url) => {
    setImgDict(prev => ({...prev,[id]: url}));
  };

  useEffect(() => {
    async function loadData() {
      const allKeys = await Storage.getAllKeys();

      for (const key of allKeys) {
        const data = await Storage.get(key);

        const name = key
        const status = data?.[name].type;
        const img = data?.[name].img;

        if (status === type) {
          addImage(name, (img.length != 0 ? img : placeholdeImgPath));
          setItemList((prev) => [...prev, name]);
        }
      }
    }

    loadData();

  }, []);

  Storage.onChange(updateList);

  return (
    <div>
      {itemList.map((item, index) => (
        <div className='list-elem' key={index}>
          <div className='info-container'>
            <div className='avata-container'>
              <img src={imgDict[item] ? imgDict[item] : placeholdeImgPath } />
            </div>
            <p>{item}</p>
          </div>
          <button className='remove-btn' onClick={() => removeItem(item)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function NavListIndicator({tab, category}) {
  return (
    <div className='nav-indicator'>
      <p>{category}</p>
      <p>&#62;</p>
      <p className='nav-indicator-active'>{tab}</p>
    </div>
  )
}

export function BadPlayerTab() {
  return (
    <>
      <div className="container">
          <div className="bad-standing-list-container">
              <h2>Bad Player</h2>
              <div id="bad-standing-list">
                <PlayerList type={"bad"} />
              </div>
          </div>
      </div>
    </>
  )
}

export function GoodPlayerTab() {
  return (
    <>
      <div className="container">
          <div className="good-standing-list-container">
              <h2>Good Player</h2>
              <div id="good-standing-list">
                <PlayerList type={"good"}/>
              </div>
          </div>
      </div>
    </>
  )
}

export function OptionsGenrealTab() {
  return (
    <>
      <div className="container">
        <h2>Genreal</h2>
      </div>
    </>
  )
}



export default function() {
  const [tab, setTab] = useState("Bad Player")
  const [tabCategory, setTabCategory] = useState("Standing")
  const version = chrome.runtime.getManifest().version

  const tabHandling = (tab, category) => {
    setTab(tab)
    setTabCategory(category)
  }

  const renderContent = () => {
    switch (tab) {
      case "Bad Player": return <div><BadPlayerTab /></div>;
      case "Good Player": return <div><GoodPlayerTab /></div>;
      case "General": return <div><OptionsGenrealTab /></div>;
      default: return null;
    }
  };

  return (
    <div className='full-continer'>
      <div className='sidebar-container'>
        <div className='header-wrap'>
          <img className='header-img' src='../icon/icon48.png'></img>
          <p className='header-text'>BLACKLIST</p>
        </div>
        <div className='nav-list-container'>
          <div className='standing-wrap'>
            <p>Standing</p>
            <nav className='standig-nav'>
              <a className={tab === "Bad Player" ? "active" : ""} onClick={() => tabHandling("Bad Player", "Standing")}>Bad Player</a>
              <a className={tab === "Good Player" ? "active" : ""} onClick={() => tabHandling("Good Player", "Standing")}>Good Player</a>
            </nav>
          </div>
          <div className='options-wrap'>
            <p>Options</p>
            <nav className='option-nav'>
              <a className={tab === "General" ? "active" : ""} onClick={() => tabHandling("General", "Options")}>General</a>
            </nav>
          </div>
        </div>
        <div className='app-version-info'>
          <p>Version: {version}</p>
        </div>
      </div>
      <div className='content-container'>
        <NavListIndicator tab={tab} category={tabCategory}/>
        {renderContent()}
      </div>
    </div>
  )
}
