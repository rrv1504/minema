# AML Viva Guide: Minema

## Project basics

### 1. What is Minema?
Minema is a group movie-hall booking system. A user books an entire hall for a group. Its main AML feature ranks movies from group mood, booking history, movie metadata, and popularity. It also predicts the likelihood of booking cancellation.

### 2. What is the machine learning problem?
The primary problem is personalized recommendation: rank movies that best fit a group and a user. The secondary problem is binary classification: predict whether a booking is likely to be cancelled.

### 3. Is the solution supervised or unsupervised?
It is hybrid. Content-based recommendation uses TF-IDF and cosine similarity without labelled ratings. Cancellation prediction uses supervised Random Forest classification. Future collaborative filtering with Truncated SVD and taste clustering with KMeans are unsupervised.

### 4. Why use a hybrid recommender?
A pure ML model has cold-start issues for a new user with no history. A rule-only system does not personalize. Minema combines explainable mood and popularity scoring with a model-based content score for personal history.

### 5. Explain the architecture.
React is the frontend. Express and TypeScript expose authenticated REST APIs. MongoDB stores application data. FastAPI hosts the Python ML microservice. Express fetches active movies and user history, then calls FastAPI internally. Python returns the recommendation result to Express, and Express returns it to React.

## Data and features

### 6. What is stored for each user?
Name, email, password hash, role, phone number, booking history, preferred genres, and mood history. Booking history and preferred genres are used for personalization.

### 7. What movie features are used?
The content model uses movie title and genre. The explainable rank uses genre, rating, and total booking count. In a larger version, description, cast, language, release year, and tags can be added.

### 8. What is the recommendation input?
The frontend sends group size and a distribution of six moods: pumped, romantic, mysterious, adventurous, chill, and epic. The server adds active movie metadata and the authenticated user’s past booked genres.

### 9. What is feature engineering here?
Feature engineering converts raw records into useful numeric or text features. Examples are mood proportions, genre frequencies, popularity normalization, consensus percentage, group size, time slot hour, and weekday.

### 10. How is consensus percentage computed?
Consensus percentage equals dominant mood count divided by total assigned mood count multiplied by 100. Strong consensus means greater group agreement and usually lower cancellation risk.

### 11. How is popularity normalized?
The system uses min-max scaling. The formula is booking count minus minimum count, divided by maximum count minus minimum count plus a small epsilon. This is then mapped to 0 to 20 points. Epsilon prevents division by zero.

## Content-based recommendation model

### 12. What recommendation model is used now?
Minema uses a content-based recommender built with scikit-learn TfidfVectorizer and cosine_similarity. The code is in ml-service/recommendation_model.py.

### 13. What is TF-IDF?
TF-IDF means Term Frequency-Inverse Document Frequency. It converts text into a weighted numeric vector. A term gets a high score when it is important for one document but less common across all documents.

### 14. Why is TF-IDF suitable for this project?
The project has a small catalog and limited ratings data, but it has movie text metadata. TF-IDF works immediately from title and genre, is fast, explainable, and does not need a huge training dataset.

### 15. How is a movie represented for TF-IDF?
Each movie becomes a document, for example Romance Romance Love in Paris. Genre is repeated deliberately so it remains the strongest learned signal. The user profile is built by joining genres from past bookings, for example Romance Drama Romance.

### 16. What is cosine similarity?
Cosine similarity measures the angle between two feature vectors. Its formula is A dot B divided by the product of the vector lengths. A value close to one means the user profile and movie profile are similar; close to zero means they are unrelated.

### 17. How is modelScore calculated?
The vectorizer fits the current movie catalog. The user’s booked-genre profile is transformed by the same vectorizer. Cosine similarity is calculated between that profile and each movie vector, then multiplied by 100.

### 18. How does modelScore affect ranking?
The specified explainable score remains the main rank. The modelScore is used to personalize and break close or equal candidates. It also adds a reason when a movie has a strong content-model match with booking history.

### 19. What happens for a new user?
A new user has no previous genres, so no individual profile exists. The model returns a neutral score. The system then recommends primarily from the group mood, popularity, and rating. This is how Minema handles cold start.

### 20. What are the strengths and limitations of content-based filtering?
It works with small data, supports new movies, and gives explanations. Its limitation is overspecialization: it may repeatedly suggest genres the user already booked. It also depends on accurate movie metadata.

## Explainable recommendation score

### 21. Explain the mood score.
Each mood maps to suitable genres. A direct match with the dominant mood receives 40 points; an adjacent genre receives 18. The final mood score blends 70 percent dominant-mood score with 30 percent weighted score across all moods.

### 22. Why use genre adjacency?
Preferences are not fully separate. A person who selects Action may enjoy Thriller or Adventure. Adjacency gives partial credit for such near matches instead of giving zero.

### 23. Explain the personalization score.
The system counts genres from a user’s booking history. The most-booked genre gets 30 points, other booked genres get 20, new users receive a neutral 15, and unrelated genres get 5.

### 24. Explain the popularity score.
Popularity uses total confirmed bookings after min-max normalization. Popular movies receive up to 20 points. This gives the system a useful group-level signal without making popularity the only factor.

### 25. What is the final score formula?
Final score is the minimum of 99 and the sum of mood score, personalization score, popularity score, rating bonus, and a fixed 12-point offset. Capping at 99 avoids claiming perfect certainty.

### 26. Why keep rule-based scoring when a model exists?
Rules meet product requirements, work for cold start, and create understandable explanations. The model adds personalized similarity. The hybrid approach is more reliable than either approach alone for limited data.

## Cancellation classification

### 27. Which model predicts cancellation risk?
The project uses a scikit-learn RandomForestClassifier. The serialized model is stored as ml-service/models/cancellation_classifier.joblib.

### 28. What is a Random Forest?
A Random Forest is an ensemble of decision trees. Each tree sees a random subset of data and features. The forest averages their decisions, which usually reduces overfitting compared with a single decision tree.

### 29. What features go into the cancellation model?
Group size, mood-consensus percentage, top recommendation match score, time-slot hour, and day of week.

### 30. What is the target variable?
The target is binary. One means the booking was cancelled, and zero means it remained confirmed.

### 31. How is the current cancellation model trained?
There was initially no real labelled cancellation data. The system therefore creates 5,000 reproducible bootstrap examples based on the documented risk policy and controlled time and weekday variation. The training script fits a 300-tree Random Forest and saves it with joblib.

### 32. Is bootstrap data a limitation?
Yes. It demonstrates a real end-to-end model pipeline, but its patterns come partly from assumptions. In production, the classifier must be retrained with real confirmed and cancelled bookings from MongoDB.

### 33. What does predict_proba do?
It returns probability for each class. The probability of class one, cancellation, is multiplied by 100 and returned as cancellation risk percentage.

## Evaluation and training

### 34. Which metrics evaluate a cancellation classifier?
Use accuracy, precision, recall, F1-score, ROC-AUC, and a confusion matrix. Recall matters when missing a likely cancellation is costly. Precision matters when unnecessary warnings hurt user experience.

### 35. What is a confusion matrix?
It contains true positives, false positives, true negatives, and false negatives. In this project, a true positive is correctly predicting that a booking will be cancelled.

### 36. What is overfitting?
Overfitting occurs when the model learns training-specific noise rather than general patterns. It is reduced through train-test evaluation, diverse data, tuning, and Random Forest controls such as minimum leaf size.

### 37. Why set random_state to 42?
It makes randomness reproducible. The same seed, code, and data produce the same bootstrap samples and model behavior, helping debugging and reliable demonstration.

### 38. How would you retrain using real data?
Export bookings with group size, consensus, match score, date, time, and final status. Convert time to hour and date to weekday. Split data into training and testing sets, train candidate models, compare metrics, save the best model, and deploy the saved artifact.

## Future AML work

### 39. What is collaborative filtering?
Collaborative filtering learns from patterns across many users. For example, users who book similar genres may enjoy similar movies. It uses interactions rather than only movie metadata.

### 40. Why use Truncated SVD later?
The user-movie interaction matrix is sparse. Truncated SVD reduces it into latent preference factors and can discover hidden tastes such as a user pattern for both fantasy and adventure.

### 41. What is a latent factor?
It is a hidden learned preference pattern. It is not necessarily a named genre. A factor might represent family-friendly movies, action-fantasy preference, or late-night thriller behavior.

### 42. How can KMeans help?
KMeans clusters users by genre-preference vectors. For a new user with little history, the system can use the nearest cluster’s centroid to provide an additional preference signal.

### 43. Why are SVD and KMeans not primary now?
They need many genuine interactions from many users. The current seed dataset is too small and artificial for reliable collaborative patterns. Content-based recommendation is the right initial solution.

## System and security

### 44. Why use a FastAPI Python microservice?
Python has mature ML libraries such as scikit-learn, NumPy, and joblib. Express handles application APIs and MongoDB; FastAPI handles model inference. This separates responsibilities cleanly.

### 45. Why does FastAPI not directly access MongoDB?
Express owns authentication and database access. It sends only needed data to FastAPI, avoiding duplicate database logic and reducing exposed credentials.

### 46. How is authentication handled?
Express issues a short-lived JWT access token and a longer-lived refresh token. The frontend sends the access token in the Authorization header. Refresh tokens are hashed before storage.

### 47. How is double booking avoided?
The backend checks hall availability and MongoDB enforces a partial unique index on hall, selected date, and time slot for confirmed bookings. The database index protects against simultaneous booking requests.

### 48. What privacy concerns exist?
Booking history is behavioral data. Passwords must be hashed, tokens protected, and only necessary data sent to the ML service. Sensitive personal attributes should not be used for recommendation.

## One-minute answer

Minema is a group movie-hall booking application with a hybrid recommendation engine. React sends group size and mood distribution to Express. Express authenticates the user, retrieves active movies and past booked genres from MongoDB, and calls a FastAPI ML service. The ML service uses TF-IDF and cosine similarity to calculate a content-based model score from the user’s booking history. It combines this score with explainable mood, history, popularity, and rating signals to rank movies. A Random Forest classifier predicts cancellation probability from group size, consensus, match score, time slot, and weekday. The architecture works with sparse initial data and can later expand into collaborative filtering with Truncated SVD.
