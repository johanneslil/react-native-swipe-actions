"use strict";

import React, { Component } from "react";
import { View, PanResponder } from "react-native";

export const swipeDirections = {
  SWIPE_UP: "SWIPE_UP",
  SWIPE_DOWN: "SWIPE_DOWN",
  SWIPE_LEFT: "SWIPE_LEFT",
  SWIPE_RIGHT: "SWIPE_RIGHT"
};

const swipeConfig = {
  velocityThreshold: 0.3,
  directionalOffsetThreshold: 70,
  gestureIsClickThreshold: 5,
  enableSwipeUp: true,
  enableSwipeDown: true,
  enableSwipeLeft: true,
  enableSwipeRight: true,
};

function isValidSwipe(
  velocity,
  velocityThreshold,
  directionalOffset,
  directionalOffsetThreshold
) {
  return (
    Math.abs(velocity) > velocityThreshold &&
    Math.abs(directionalOffset) < directionalOffsetThreshold
  );
}

class GestureRecognizer extends Component {
  constructor(props, context) {
    super(props, context);
    this.swipeConfig = Object.assign(swipeConfig, props.config);

    const responderEnd = this._handlePanResponderEnd.bind(this);
    const shouldSetResponder = this._handleShouldSetPanResponder.bind(this);
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: shouldSetResponder,
      onMoveShouldSetPanResponder: shouldSetResponder,
      onPanResponderRelease: responderEnd,
      onPanResponderTerminate: responderEnd
    });
  }
  
  componentDidUpdate(prevProps) {
    if (this.props.config !== prevProps.config) {
      this.swipeConfig = Object.assign(swipeConfig, this.props.config);
    }
  }
  
  _handleShouldSetPanResponder(evt, gestureState) {
    return (
      evt.nativeEvent.touches.length === 1 &&
      !this._gestureIsClick(gestureState) &&
      this._verifySwipe(gestureState)
    );
  }

  _verifySwipe(gestureState) {
    const swipeDirection = this._getSwipeDirection(gestureState);
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
    const {
      enableSwipeUp,
      enableSwipeDown,
      enableSwipeLeft,
      enableSwipeRight,
    } = this.swipeConfig;
    return (
      (swipeDirection === SWIPE_UP && enableSwipeUp) ||
      (swipeDirection === SWIPE_DOWN && enableSwipeDown) ||
      (swipeDirection === SWIPE_LEFT && enableSwipeLeft) ||
      (swipeDirection === SWIPE_RIGHT && enableSwipeRight)
    );
  }

  _gestureIsClick(gestureState) {
    return (
      Math.abs(gestureState.dx) < swipeConfig.gestureIsClickThreshold &&
      Math.abs(gestureState.dy) < swipeConfig.gestureIsClickThreshold
    );
  }

  _handlePanResponderEnd(evt, gestureState) {
    const swipeDirection = this._getSwipeDirection(gestureState);
    this._triggerSwipeHandlers(swipeDirection, gestureState);
  }

  _triggerSwipeHandlers(swipeDirection, gestureState) {
    const {
      onSwipe,
      onSwipeUp,
      onSwipeDown,
      onSwipeLeft,
      onSwipeRight
    } = this.props;
    const {
      enableSwipeUp,
      enableSwipeDown,
      enableSwipeLeft,
      enableSwipeRight,
    } = this.swipeConfig
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
    onSwipe && onSwipe(swipeDirection, gestureState);
    switch (swipeDirection) {
      case SWIPE_UP:
        if (enableSwipeUp) onSwipeUp && onSwipeUp(gestureState);
        break;
      case SWIPE_DOWN:
        if (enableSwipeDown) onSwipeDown && onSwipeDown(gestureState);
        break;
      case SWIPE_LEFT:
        if (enableSwipeLeft) onSwipeLeft && onSwipeLeft(gestureState);
        break;
      case SWIPE_RIGHT:
        if (enableSwipeRight) onSwipeRight && onSwipeRight(gestureState);
        break;
    }
  }

  _getSwipeDirection(gestureState) {
    const { SWIPE_LEFT, SWIPE_RIGHT, SWIPE_UP, SWIPE_DOWN } = swipeDirections;
    const { dx, dy } = gestureState;
    if (this._isValidHorizontalSwipe(gestureState)) {
      return dx > 0 ? SWIPE_RIGHT : SWIPE_LEFT;
    } else if (this._isValidVerticalSwipe(gestureState)) {
      return dy > 0 ? SWIPE_DOWN : SWIPE_UP;
    }
    return null;
  }

  _isValidHorizontalSwipe(gestureState) {
    const { vx, dy } = gestureState;
    const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig;
    return isValidSwipe(vx, velocityThreshold, dy, directionalOffsetThreshold);
  }

  _isValidVerticalSwipe(gestureState) {
    const { vy, dx } = gestureState;
    const { velocityThreshold, directionalOffsetThreshold } = this.swipeConfig;
    return isValidSwipe(vy, velocityThreshold, dx, directionalOffsetThreshold);
  }

  render() {
    return <View {...this.props} {...this._panResponder.panHandlers} />;
  }
}

export default GestureRecognizer;
