import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { createStructuredSelector } from "reselect";
// This page
import * as selector from "./sdk/selectors";
import {
  validateRepoName,
  updateQuery,
  connectMetamask,
  publish,
} from "./sdk/actions";
// Imgs
import metamaskIcon from "./img/metamask-white.png";
// Utils
import { parseUrlQuery } from "./utils/urlQuery";
import newTabProps from "./utils/newTabProps";
// Components
import Title from "./components/Title";
import SubTitle from "./components/SubTitle";
import Card from "./components/Card";
import { Publish as PublishNew } from "./AppNew";

const ipfsGateway = "http://my.ipfs.dnp.dappnode.eth:8080/ipfs/";

// Necessary code to refresh the userAddress
// when user interacts with the metamask extension
let configureMetamaskListeners = (cb) => {
  if (!window.ethereum) return;
  window.ethereum.on("accountsChanged", (accounts) => {
    cb("userAccount", accounts[0]);
  });
  // Singleton
  configureMetamaskListeners = () => {};
};

const paramMapping = {
  r: "dnpName",
  v: "version",
  d: "developerAddress",
  h: "manifestIpfsHash",
};

class Publish extends React.Component {
  static propTypes = {
    formFields: PropTypes.array.isRequired,
  };

  componentDidMount() {
    const urlQuery = window.location.search.replace("?", "");
    if (urlQuery) {
      try {
        const params = parseUrlQuery(urlQuery);
        console.log(
          "A prefilled link was found for the SDK Publish, params:",
          params
        );
        Object.keys(paramMapping).forEach((key) => {
          if (params[key])
            this.props.updateQuery(paramMapping[key], params[key]);
        });
      } catch (e) {
        console.error(`Error parsing urlQuery "${urlQuery}": ${e.stack}`);
      }
    }
    configureMetamaskListeners(this.props.updateQuery.bind(this));
  }

  render() {
    const id = "Publish";

    const buttonInput = this.props.buttonInput;
    const showManifestButtons = this.props.showManifestButtons;
    const manifestHash = (showManifestButtons || "").split("ipfs/")[1];
    const disablePublish = this.props.disablePublish;

    const txPreview = this.props.txPreview;

    const getInputClass = ({ loading, success, error }) =>
      loading ? "is-loading" : error ? "is-invalid" : success ? "is-valid" : "";

    return (
      <div id="main" className="app">
        <Title title={"SDK"} subtitle={id} />

        <SubTitle>Transaction details</SubTitle>
        <Card>
          <form>
            {/* Main rows of the form */}
            {this.props.formFields
              .filter(({ hide }) => !hide)
              .map((item) => {
                return (
                  <div className="form-group row" key={item.id}>
                    <label
                      htmlFor={`form-${item.id}`}
                      className="col-sm-2 col-form-label"
                    >
                      {item.name}
                    </label>
                    <div className="col-sm-10">
                      <input
                        className={`form-control ${getInputClass(item)}`}
                        placeholder={item.placeholder}
                        value={(this.props.query || {})[item.id] || ""}
                        onChange={(e) =>
                          this.props.updateQuery(item.id, e.target.value)
                        }
                      />
                      {!item.loading && item.success ? (
                        <div className="valid-feedback">
                          {item.success.map((line, i) => (
                            <span key={i}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {!item.loading && item.error ? (
                        <div className="invalid-feedback">
                          {item.error.map((line, i) => (
                            <span key={i}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <small className="form-text text-muted">
                        {item.loading ? "Loading... " : ""}
                        {item.help}
                      </small>
                    </div>
                  </div>
                );
              })}

            {/* Extra buttons to test manifest */}
            {showManifestButtons ? (
              <div className="form-group row">
                <div className="col-sm-2" />
                <div className="col-sm-10">
                  <a
                    className="btn btn-outline-dappnode mr-3"
                    href={ipfsGateway + manifestHash}
                    {...newTabProps}
                  >
                    Open manifest
                  </a>
                  <a
                    style={{ color: "inherit", textDecoration: "inherit" }}
                    href={encodeURIComponent("/ipfs/" + manifestHash)}
                  >
                    <button className="btn btn-outline-dappnode">
                      Install DAppNode Package
                    </button>
                  </a>
                </div>
              </div>
            ) : null}

            {/* Transaction preview code box */}
            {!disablePublish && txPreview ? (
              <div className="form-group row">
                <label className="col-sm-2 col-form-label text-secondary">
                  Transaction preview
                </label>
                <div className="col-sm-10">
                  <div
                    className="error-stack"
                    style={{
                      whiteSpace: "inherit",
                    }}
                  >
                    {Object.keys(txPreview).map((key) => (
                      <span key={key}>
                        {`${key}: ${txPreview[key]}`}
                        <br />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </form>
        </Card>
        <PublishNew></PublishNew>
      </div>
    );
  }
}

// Container

const mapStateToProps = createStructuredSelector({
  registries: selector.registries,
  repoNames: selector.repoName,
  query: selector.query,
  queryResult: selector.queryResult,
  formFields: selector.getInputFields,
  buttonInput: selector.getButtonInput,
  disablePublish: selector.getDisablePublish,
  showManifestButtons: selector.getShowManifestButtons,
  txPreview: selector.getTransactionPreview,
  genericError: selector.getGenericError,
});

// Uses bindActionCreators to wrap action creators with dispatch
const mapDispatchToProps = {
  validateRepoName,
  updateQuery,
  connectMetamask,
  publish,
};

export default connect(mapStateToProps, mapDispatchToProps)(Publish);