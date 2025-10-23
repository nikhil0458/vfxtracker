// Function to handle double-click (Directly opens the modal)
const handleCellDoubleClick = (record, columnKey) => {
     console.log("columnKey", columnKey);
     console.log("designationn", designation);
   
     if (columnKey === "status" && designation === "Artist") {
       const currentStatus = record.status;
       console.log("Current Status:", currentStatus);
   
       const options = status_order[currentStatus] || [];
   
       if (options.length === 0) {
         message.info("No further status transitions available.");
         return;
       }
   
       setEditingRow(record);
       setSelectedStatus(""); // Clear any previous selection
       setStatusOptions(options);
       setModalType("status");
       setIsStatusModalVisible(true);
     }
   
     if (columnKey === "artist_comment" && designation === "Artist") {
       setEditingRow(record);
       setArtistComment(record.artist_comment || "");
       setModalType("comment");
       setIsStatusModalVisible(true);
     }
   };
   
   // Function to handle status change (WIP check only for YTS)
   const handleStatusChange = async (value) => {
     setSelectedStatus(value);
     
     // If current status is YTS and user selects WIP
     if (editingRow?.status === "YTS" && value === "WIP") {
       try {
         const response = await axios.get(`http://${ip_port}/assign_shot_task/`, {
           params: { "artist_id": editingRow.artist_id, "status": "WIP" },
           headers: { Authorization: `Bearer ${accessToken}` }
         });
   
         console.log("length_of_the_response_data", response.data.length);
         if (response.data.length >= 1) {
           message.warning("This artist has WIP tasks. Status update is blocked.");
           setSelectedStatus(""); 
           return;
         }
       } catch (error) {
         console.error("Error checking artist tasks:", error);
         message.error("Failed to verify artist task status.");
         setSelectedStatus(""); 
         return;
       }
     }
   };
   



   <Modal
  title={modalType === "status" ? "Update Status" : "Update Artist Comment"}
  open={isStatusModalVisible}
  onOk={async () => {
    try {
      if (modalType === "status" && !selectedStatus) {
        message.warning("Please select Status before proceeding.");
        return;
      }

      if (modalType === "status" && selectedStatus === "READY TO REVIEW" && !mediaPath.trim()) {
        message.warning("Please enter the media path before proceeding.");
        return;
      }

      let updatedRow = { ...editingRow };
      if (modalType === "status") {
        updatedRow.status = selectedStatus;
        if (selectedStatus === "READY TO REVIEW") {
          updatedRow.media_path = mediaPath;
        }

        await axios.patch(
          `http://${ip_port}/assign_shot_task/${editingRow._id}/`,
          { 
            status: selectedStatus,
            ...(selectedStatus === "READY TO REVIEW" && { media_path: mediaPath }) 
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Status updated successfully");
      } 

      if (modalType === "comment") {
        if (!artistComment.trim()) {
          message.warning("Please enter a comment before proceeding.");
          return;
        }
        updatedRow.artist_comment = artistComment;

        await axios.patch(
          `http://${ip_port}/assign_shot_task/${editingRow._id}/`,
          { artist_comment: artistComment },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Artist comment updated successfully");
      }

      const updatedData = taskData.map((item) =>
        item._id === editingRow._id ? updatedRow : item
      );

      setTaskData(updatedData);
      localStorage.setItem("finalTaskData", JSON.stringify(updatedData)); 
      setIsStatusModalVisible(false);
      setEditingRow(null);
      setMediaPath(""); 
      setArtistComment("");
    } catch (error) {
      console.error("Error updating:", error);
      message.error("Failed to update in the database.");
    }
  }}
  onCancel={() => {
    setIsStatusModalVisible(false);
    setEditingRow(null);
    setMediaPath(""); 
    setArtistComment("");
  }}
>
  {/* Dynamic UI based on modalType */}
  {modalType === "status" && (
    <>
      <Radio.Group value={selectedStatus} onChange={(e) => handleStatusChange(e.target.value)}>
        {statusOptions.map((status) => (
          <Radio key={status} value={status}>
            {status}
          </Radio>
        ))}
      </Radio.Group>

      {selectedStatus === "READY TO REVIEW" && (
        <div style={{ marginTop: "10px" }}>
          <label>Enter Media Path:</label>
          <Input 
            placeholder="Enter media path" 
            value={mediaPath}
            onChange={(e) => setMediaPath(e.target.value)}
            status={!mediaPath.trim() ? "error" : ""}
          />
        </div>
      )}
    </>
  )}
</Modal>
