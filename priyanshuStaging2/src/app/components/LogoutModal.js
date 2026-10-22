"use client"
import React, { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const LogoutModal = ({ show = false, onClose = () => { }, onLogout = () => { } }) => {

    useEffect(() => {
        if (show) {
            document.documentElement.style.setProperty("overflow", "hidden", "important");
            document.body.style.setProperty("overflow", "hidden", "important");
            document.body.style.setProperty("position", "fixed", "important");
            // stops touch scroll 
            document.body.style.setProperty("width", "100%", "important");
        } else {
            document.documentElement.style.setProperty("overflow", "", "important");
            document.body.style.setProperty("overflow", "", "important");
            document.body.style.setProperty("position", "", "important");
            document.body.style.setProperty("width", "", "important");
        } return () => {
            document.documentElement.style.setProperty("overflow", "", "important");
            document.body.style.setProperty("overflow", "", "important");
            document.body.style.setProperty("position", "", "important");
            document.body.style.setProperty("width", "", "important");
        };
    }, [show]);

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            backdrop="static"
            keyboard={false}
            className="log-out-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title className="title">Log Out</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <img src="/account_images/logout-logo.svg" alt="logo" className="logo" />
                <p className="alert">Are you sure you want to log out?</p>
            </Modal.Body>

            <Modal.Footer>
                {/* <div className="button-group"> */}
                <Button variant="secondary" onClick={onClose} id="cancelBtn" className="Btn">
                    Cancel
                </Button>
                <Button variant="primary" onClick={onLogout} id="logoutBtn" className="Btn">
                    Log Out
                </Button>

            </Modal.Footer>
        </Modal>
    );
};

export default LogoutModal;
