from sklearn.cluster import KMeans
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import RandomForestClassifier

class CollaborativeFilteringModel:
    def __init__(self, latent_factors: int = 20) -> None:
        self.svd = TruncatedSVD(n_components=latent_factors, random_state=42)
        self.is_fitted = False
    def fit(self, interaction_matrix):
        self.svd.fit(interaction_matrix); self.is_fitted = True; return self

class CancellationPredictionModel:
    feature_names = ["group_size", "consensus_percent", "match_score", "time_slot_hour", "day_of_week"]
    def __init__(self) -> None:
        self.classifier = RandomForestClassifier(n_estimators=200, random_state=42)
        self.is_fitted = False
    def fit(self, features, cancelled_labels):
        self.classifier.fit(features, cancelled_labels); self.is_fitted = True; return self

class TasteClusterModel:
    def __init__(self, clusters: int = 5) -> None:
        self.kmeans = KMeans(n_clusters=clusters, random_state=42, n_init="auto")
        self.is_fitted = False
    def fit(self, genre_vectors):
        self.kmeans.fit(genre_vectors); self.is_fitted = True; return self
