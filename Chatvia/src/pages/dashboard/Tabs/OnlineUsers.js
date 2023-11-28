import React from 'react';
import { Link } from 'react-router-dom';
import avatar2 from '../../../assets/images/users/avatar-2.jpg';
import avatar3 from '../../../assets/images/users/avatar-3.jpg';

import avatar4 from '../../../assets/images/users/avatar-4.jpg';

import avatar5 from '../../../assets/images/users/avatar-5.jpg';

//carousel
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
const OnlineUsers = () => {
  const responsive = {
    0: { items: 4 },
    1024: { items: 5 },
  };
  return (
    <React.Fragment>
      {/* Start user status */}
      <div className="px-4 pb-4 dot_remove" dir="ltr">
        <AliceCarousel
          responsive={responsive}
          disableDotsControls={false}
          disableButtonsControls={false}
          mouseTracking
        >
          <div className="item">
            <Link to="#" className="user-status-box">
              <div className="avatar-xs mx-auto d-block chat-user-img online">
                <img
                  src={avatar2}
                  alt="user-img"
                  className="img-fluid rounded-circle"
                />
                <span className="user-status"></span>
              </div>

              <h5 className="font-size-13 text-truncate mt-3 mb-1">{}</h5>
            </Link>
          </div>
          <div className="item">
            <Link to="#" className="user-status-box">
              <div className="avatar-xs mx-auto d-block chat-user-img online">
                <img
                  src={avatar3}
                  alt="user-img"
                  className="img-fluid rounded-circle"
                />
                <span className="user-status"></span>
              </div>

              <h5 className="font-size-13 text-truncate mt-3 mb-1">{}</h5>
            </Link>
          </div>
          <div className="item">
            <Link to="#" className="user-status-box">
              <div className="avatar-xs mx-auto d-block chat-user-img online">
                <img
                  src={avatar4}
                  alt="user-img"
                  className="img-fluid rounded-circle"
                />
                <span className="user-status"></span>
              </div>

              <h5 className="font-size-13 text-truncate mt-3 mb-1">{}</h5>
            </Link>
          </div>
          <div className="item">
            <Link to="#" className="user-status-box">
              <div className="avatar-xs mx-auto d-block chat-user-img online">
                <img
                  src={avatar5}
                  alt="user-img"
                  className="img-fluid rounded-circle"
                />
                <span className="user-status"></span>
              </div>

              <h5 className="font-size-13 text-truncate mt-3 mb-1">{}</h5>
            </Link>
          </div>
        </AliceCarousel>
        {/* end user status carousel */}
      </div>
      {/* end user status  */}
    </React.Fragment>
  );
};

export default OnlineUsers;
