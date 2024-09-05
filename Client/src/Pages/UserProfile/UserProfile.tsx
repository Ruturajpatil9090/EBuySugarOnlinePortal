import React, { ChangeEvent, useState } from 'react';
import "../../styles/UserProfile.module.css";

const UserProfile: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'company':
        setCompany(value);
        break;
      case 'email':
        setEmail(value);
        break;
    }
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTimeZone(event.target.value);
  };

  return (
    <div>
      <div className="container bootstrap snippets bootdey">
        <h1 className="text-primary">Edit Profile</h1>
        <hr />
        <div className="row">
          <div className="col-md-3">
            <div className="text-center">
              <img
                src="https://bootdey.com/img/Content/avatar/avatar7.png"
                className="avatar img-circle img-thumbnail"
                alt="avatar"
              />
              <h6>Upload a different photo...</h6>
              <input type="file" className="form-control" />
            </div>
          </div>

          <div className="col-md-9 personal-info">
            <div className="alert alert-info alert-dismissable">
              <a className="panel-close close" data-dismiss="alert">
                ×
              </a>
              <i className="fa fa-coffee"></i>
              This is an <strong>.alert</strong>. Use this to show important messages to the user.
            </div>
            <h3>Personal info</h3>

            <form className="form-horizontal" role="form">
              <div className="form-group">
                <label className="col-lg-3 control-label">First name:</label>
                <div className="col-lg-8">
                  <input
                    className="form-control"
                    type="text"
                    name="firstName"
                    value={firstName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-lg-3 control-label">Last name:</label>
                <div className="col-lg-8">
                  <input
                    className="form-control"
                    type="text"
                    name="lastName"
                    value={lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-lg-3 control-label">Company:</label>
                <div className="col-lg-8">
                  <input
                    className="form-control"
                    type="text"
                    name="company"
                    value={company}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-lg-3 control-label">Email:</label>
                <div className="col-lg-8">
                  <input
                    className="form-control"
                    type="text"
                    name="email"
                    value={email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="col-lg-3 control-label">Time Zone:</label>
                <div className="col-lg-8">
                  <div className="ui-select">
                    <select
                      id="user_time_zone"
                      className="form-control"
                      value={timeZone}
                      onChange={handleSelectChange}
                    >
                      <option value="Hawaii">(GMT-10:00) Hawaii</option>
                      <option value="Alaska">(GMT-09:00) Alaska</option>
                      <option value="Pacific Time (US & Canada)">
                        (GMT-08:00) Pacific Time (US & Canada)
                      </option>
                      <option value="Arizona">(GMT-07:00) Arizona</option>
                      <option value="Mountain Time (US & Canada)">
                        (GMT-07:00) Mountain Time (US & Canada)
                      </option>
                      <option value="Eastern Time (US & Canada)">
                        (GMT-05:00) Eastern Time (US & Canada)
                      </option>
                      <option value="Indiana (East)">
                        (GMT-05:00) Indiana (East)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default UserProfile;
