import React from 'react';

export default function (props) {
  const { data, custom_setting } = props;
  const welcomeText = custom_setting?.welcome_text || "Hello Widget";
  const items = data?.item_data?.items || [];

  return (
    <div className="hello-widget-container">
      <h1 className="hello-title">{welcomeText}</h1>
      <div className="item-list">
        {items.length > 0 ? (
          <ul>
            {items.map((item, index) => (
              <li key={index} className="item-row">
                {item?.title?.value || "No Title"}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-data">No data available.</p>
        )}
      </div>
    </div>
  );
}
