sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend(
    "PaymentWorkflow.workflowuiPayment.controller.App",
    {
      onAfterRendering: function () {
        // Delay execution to ensure the element is rendered
        setTimeout(() => {
          this.checkAndUpdateDiv(); // Ensure the correct context
        }, 500); // Delay of 500ms, adjust as needed

        // Aggregate logic: sum the values of all visible divs with the 'data-value' attribute
        let total = 0;
        jQuery("div[data-value]").each((_, elem) => {
          let value = parseFloat(jQuery(elem).data("value")) || 0;
          total += value; // Aggregate the value
        });

        console.log("Aggregate function executed. Total sum of div values:", total);
        // You can use the 'total' value to update a model or UI element if needed
      },

      checkAndUpdateDiv: function () {
        // Use the 'ends with' selector to match the dynamic part of the ID
        var oDiv = jQuery("[id$='commentSection-anchor']");

        // Check if the div exists
        if (oDiv.length) {
          oDiv.hide(); // Hide the div if found
          oDiv.attr("role", "none"); // Update attributes
          oDiv.attr("aria-selected", "false");
          console.log("Div found and set to invisible.");
        } else {
          console.log("Div not found.");
        }
      },

      onBeforeRendering: function () {
        setTimeout(
          function () {
            var oView = this.getView();
            var oData = oView.oPropagatedProperties.oModels.context.oData;
            var baseUrl = oData.link;

            // Perform AJAX request to retrieve data
            $.ajax({
              url: baseUrl,
              method: "GET",
              success: function (oData) {
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({ Files: oData.value });
                oView.setModel(oModel, "myModel");
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error(
                  "Error fetching data: " + textStatus + " " + errorThrown
                );
              },
            });
          }.bind(this),
          1000
        );

        // New AJAX call to fetch comment history data
        setTimeout(
          function () {
            var oView1 = this.getView();
            var baseUrl =
              "https://f2dbf934trial-hanapri-mahindraenquiry-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/Comment";

            // Perform AJAX request to retrieve comment data
            $.ajax({
              url: baseUrl,
              method: "GET",
              success: function (oData) {
                console.log(oData);
                var oModel1 = new sap.ui.model.json.JSONModel();
                oModel1.setData({ Comments: oData.value });
                oView1.setModel(oModel1, "myComments");
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error(
                  "Error fetching comment data: " +
                  textStatus +
                  " " +
                  errorThrown
                );
              },
            });
          }.bind(this),
          1000
        );
        setTimeout(
          function () {
            var oView1 = this.getView();
            debugger
            // var oData1 = oView.oPropagatedProperties.oModels.context.oData;
            var baseUrl2 = "https://dde7cfc6trial-dev-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/Files";
            // Perform AJAX request to retrieve data
            $.ajax({
              url: baseUrl2,
              method: "GET",
              success: function(oData) {
                  console.log("Files", oData);
                  var oModel1 = new JSONModel();
                  oModel1.setData({pdf: oData.value });
                  debugger
                  oView1.setModel(oModel1,"myFile");

              },
              error: function(jqXHR, textStatus, errorThrown) {
                  console.error("Error fetching data: " + textStatus + ' ' + errorThrown);
              }
          });
          }.bind(this),
          1000
        );
      },
      onOpenPressed: function (oEvent) {
        debugger
        var baseUrl = "https://dde7cfc6trial-dev-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
        debugger
        let fileurl = oEvent.getSource().getUrl();
        var pattern = /Files.*$/;
        var match = fileurl.match(pattern);
        if (match) {
          var entityUrl = baseUrl + match[0];
        }
        oEvent.getSource().setUrl(entityUrl);
        debugger
      },


      onBrowseHistoryPress: function () {
        var oDialog = this.byId("commentHistoryDialog");

        if (!oDialog) {
          this.loadFragment({
            name: "workflowmanagement.workflowuimodule.view.CommentHistoryDialog"
          }).then(function (oDialog) {
            oDialog.open();
            this._attachClickOutsideListener(oDialog);
          }.bind(this));
        } else {
          oDialog.open();
          this._attachClickOutsideListener(oDialog);
        }
      },

      onCloseHistoryDialog: function () {
        var oDialog = this.byId("commentHistoryDialog");
        oDialog.close();
        this._detachClickOutsideListener();
      },

      _attachClickOutsideListener: function (oDialog) {
        var $dialog = oDialog.$(); // Get jQuery reference to dialog DOM element
        var that = this;

        this._outsideClickHandler = function (oEvent) {
          if (!$dialog[0].contains(oEvent.target)) {
            that.onCloseHistoryDialog();
          }
        };

        // Attach event listener for clicks outside the dialog
        $(document).on("mousedown", this._outsideClickHandler);
      },

      _detachClickOutsideListener: function () {
        // Remove the click outside event listener
        if (this._outsideClickHandler) {
          $(document).off("mousedown", this._outsideClickHandler);
          this._outsideClickHandler = null;
        }
      },


      onFilterTypeChange: function (oEvent) {
        // Logic for changing the filter in the timeline based on selection
        var sKey = oEvent.getSource().getSelectedKey();
        var oTimeline = this.byId("commentTimeline");
        oTimeline.setGroupBy(sKey);
      },
      onEscapeHandler: function (oPromise) {
        this.byId("commentHistoryDialog").close();
        oPromise.resolve();
      },

      onCloseHistoryDialog: function () {
        this.byId("commentHistoryDialog").close();
      },
    }
  );
});