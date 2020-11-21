import { CButton } from "@coreui/react";
import React from "react";
import { account0, myBlockContract } from "../../config";
import processError from "../../util/ErrorUtil";
import randomWords from "random-words";

const ipfsClient = require("ipfs-http-client");
const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
});

class Post extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageBuffer: null,
      image: null,
      imageHash: "",
      title: "",
      description: "",
      fee: 0,
    };
  }

  loadPost = (event) => {
    event.preventDefault();

    const file = event.target.files[0];
    const reader = new window.FileReader();

    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({
        imageBuffer: Buffer(reader.result),
        image: URL.createObjectURL(event.target.files[0]),
      });
    };
  };

  async onAddPost() {
    if (this.state.imageBuffer == null) {
      return;
    }

    const result = await ipfs.add(this.state.imageBuffer);

    try {
      this.setState({ imageHash: result[0].hash });

      await myBlockContract.methods
        .pushPost(
          this.state.imageHash,
          this.state.title,
          this.state.description,
          this.state.fee
        )
        .send({ from: account0, gas: 6700000 });

      this.setState({
        image: null,
        imageHash: "",
        title: "",
        description: "",
        fee: 0,
      });
    } catch (error) {
      processError(error);
      return;
    }
  }

  async generateTestData() {
    const imageBuffer = this.state.imageBuffer;
    const imageHash = (await ipfs.add(imageBuffer))[0].hash;

    for (let i = 0; i < 10; i++) {
      const title = randomWords(8).join(" ").substring(0, 25);
      const description = randomWords(100).join(" ").substring(0, 800);
      const fee = Math.floor(Math.random() * 6700000);

      try {
        await myBlockContract.methods
          .pushPost(imageHash, title, description, fee)
          .send({ from: account0, gas: 6700000 });
        console.log("Added post #" + i);
      } catch (error) {
        processError(error);
        return;
      }
    }
  }
  // async generateTestData() {
  //   const imageBuffer = this.state.imageBuffer;

  //   for (let i = 0; i < 1000; i++) {
  //     const title = randomWords(8).join(" ").substring(0, 25);
  //     const description = randomWords(100).join(" ").substring(0, 800);
  //     const fee = Math.floor(Math.random() * 1000000000000);

  //     this.setState({ title, description, fee, imageBuffer });
  //     await this.onAddPost();

  //     console.log("Added post #" + i);
  //   }
  // }

  render() {
    return (
      <>
        <div className="card">
          <div className="card-header">
            <h3 style={{ display: "inline" }}>Post</h3>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="mb-3" className="form-group" style={{}}>
              <div
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  display: "flex",
                }}
              >
                {!!this.state.image ? (
                  <img
                    src={this.state.image}
                    style={{
                      maxWidth: "90%",
                      maxHeight: "90%",
                      marginBottom: "1vh",
                    }}
                  />
                ) : (
                  <></>
                )}
              </div>

              <label
                htmlFor="title"
                style={{ fontSize: "15px", width: "100%" }}
              >
                Title
                <input
                  className="form-control"
                  maxLength="25"
                  id="title"
                  value={this.state.title}
                  placeholder="Title - 25 Characters"
                  onChange={(event) =>
                    this.setState({ title: event.target.value })
                  }
                />
              </label>

              <label
                htmlFor="description"
                style={{ fontSize: "15px", width: "100%" }}
              >
                Description
                <textarea
                  type="textarea"
                  className="form-control"
                  maxLength="800"
                  id="description"
                  value={this.state.description}
                  placeholder="Add Description - 800 Characters"
                  onChange={(event) =>
                    this.setState({ description: event.target.value })
                  }
                ></textarea>
              </label>
              <label htmlFor="fee" style={{ fontSize: "15px", width: "100%" }}>
                Fee
                <input
                  type="number"
                  className="form-control"
                  min="0"
                  id="fee"
                  value={this.state.fee}
                  onChange={(event) =>
                    this.setState({ fee: event.target.value })
                  }
                ></input>
              </label>

              <div style={{ marginTop: "1vh" }}>
                <div style={{ float: "right", display: "inline-block" }}>
                  <div style={{ display: "flex" }}>
                    <CButton
                      color="success"
                      onClick={this.onAddPost.bind(this)}
                      style={{ height: "2.5rem" }}
                    >
                      Add Post
                    </CButton>
                  </div>
                </div>
                <div style={{ float: "left" }}>
                  <label className="custom-file">
                    <input
                      type="file"
                      id="file2"
                      className="custom-file-input"
                      onChange={this.loadPost}
                    ></input>
                    <span className="custom-file-control"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <CButton
              color="primary"
              onClick={this.generateTestData.bind(this)}
              style={{ height: "2.5rem" }}
            >
              Generate Test Data
            </CButton>
          </div>
        </div>
      </>
    );
  }
}

export default Post;
