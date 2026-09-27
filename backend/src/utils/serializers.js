import storage from '../config/storage.js';

/**
 * Shared response shapers.
 *
 * Every route that returns a user, an item or a review goes through these
 * helpers so credentials and contact details can never leak by accident.
 */

/** Public user shape: no password, no email address. */
export function publicUser(user) {
  if (!user) return null;
  const { password, email, ...rest } = user;
  return rest;
}

/** Owner shape used inside items, reviews and messages. */
export const publicOwner = publicUser;

/** Item shape with its owner and category attached. */
export function publicItem(item) {
  if (!item) return null;
  const category =
    storage.findById('categories', item.categoryId) ||
    storage.findOne('categories', (entry) => entry.name === item.category);

  return {
    ...item,
    owner: publicUser(storage.findById('users', item.ownerId)),
    categoryDetails: category || null,
  };
}

/** Review shape with reviewer and reviewee attached. */
export function publicReview(review) {
  if (!review) return null;
  return {
    ...review,
    reviewer: publicUser(storage.findById('users', review.reviewerId)),
    reviewee: publicUser(storage.findById('users', review.revieweeId)),
  };
}

/** Borrow request shape with the item, borrower and owner attached. */
export function publicBorrowRequest(request) {
  if (!request) return null;
  const item = storage.findById('items', request.itemId);
  const owner = publicUser(storage.findById('users', request.ownerId));

  return {
    ...request,
    item: item ? { ...item, owner } : null,
    borrower: publicUser(storage.findById('users', request.borrowerId)),
    owner,
  };
}

export default { publicUser, publicOwner, publicItem, publicReview, publicBorrowRequest };
