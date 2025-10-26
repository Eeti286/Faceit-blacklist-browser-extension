import { useEffect } from 'react';
import { useState } from 'react';
import { Storage } from '../shared/storage';
import "./popupStyle.css";
import axios from 'axios';


export function PlayerList({ type }) {
  const [itemList, setItemList] = useState([]);
  const [imgDict, setImgDict] = useState({})

  const updateList = (changes) => {
      const name = Object.keys(changes)[0];
      setItemList(itemList.filter(item => item !== name));
  }

  const removeItem = async (item) => {
    await Storage.remove(item)
  }

  const addImage = (id, url) => {
    setImgDict(prev => ({
      ...prev,
      [id]: url
    }));
  };

  useEffect(() => {
    async function loadData() {
      const allKeys = await Storage.getAllKeys();
      for (const key of allKeys) {
        const data = await Storage.get(key);
        const name = key
        const status = data?.[name];
        if (status === type) {
          axios.get(
            `https://www.faceit.com/api/users/v1/nicknames/${name}`
          ).then((res) => addImage(name, res.data.payload.avatar));
          
          setItemList(prev => [...prev, name]);
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
              <img src={imgDict[item]} />
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


export default function() {

  return (
    <div>
      <h1>Faceit Standing Status</h1> 
      <hr className="hr-line neutral" />
      <div className="container">
          <div className="bad-standing-list-container">
              <h2>Bad Standing</h2>
              <hr className="hr-line bad" />
              <div id="bad-standing-list">
                <PlayerList type={"bad"} />
              </div>
          </div>
          <div className="good-standing-list-container">
              <h2>Good Standing</h2>
              <hr className="hr-line good" />
              <div id="good-standing-list">
                <PlayerList type={"good"}/>
              </div>
          </div>
      </div>
    </div>
  )
}
