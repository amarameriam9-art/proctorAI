# 👁️ ProctorAI – Détection de Fraude aux Examens en Temps Réel

## 📌 Présentation

ProctorAI est une application web intelligente de surveillance d'examens en ligne basée sur l'Intelligence Artificielle.

L'objectif est de détecter automatiquement les comportements suspects durant un examen afin d'assister les surveillants et de réduire les risques de fraude académique.

Avec l'augmentation des examens à distance, les méthodes de surveillance traditionnelles deviennent insuffisantes. ProctorAI propose une solution automatisée utilisant la vision par ordinateur, l'analyse audio et le traitement en temps réel.

---

## 🎯 Problématique

Chaque année, des milliers d'examens universitaires et de concours sont affectés par la fraude.

Les principales difficultés sont :

* Surveillance humaine limitée
* Fatigue des surveillants
* Subjectivité dans les décisions
* Augmentation des examens en ligne

ProctorAI vise à fournir une surveillance automatisée, continue et objective.

---

## 🚀 Fonctionnalités

### 👀 Détection du regard

Analyse du regard du candidat afin de détecter :

* Regard vers la gauche
* Regard vers la droite
* Regard hors écran
* Absence du visage

### 🧑‍🤝‍🧑 Détection de plusieurs personnes

Détection automatique lorsqu'une deuxième personne apparaît dans le champ de la webcam.

### 📱 Détection d'objets suspects

Identification des objets interdits pendant l'examen :

* Téléphone portable
* Documents
* Supports de triche

### 🔇 Analyse audio

Analyse en temps réel du microphone pour détecter :

* Voix externes
* Bruits suspects
* Tentatives d'assistance orale

### 🚨 Système d'alertes

Envoi instantané d'alertes au surveillant :

* Type d'incident
* Niveau de gravité
* Horodatage (timestamp)
* Historique des alertes

### 📊 Tableau de bord

Interface de supervision permettant :

* Le suivi des candidats
* La consultation des alertes
* Les statistiques en temps réel

---

## 🏗️ Architecture du Projet

```text
Frontend (React)
       │
       │ WebSocket
       ▼
Backend (FastAPI)
       │
 ┌─────┴─────┐
 │           │
 ▼           ▼
Vision IA   Analyse Audio
 │           │
 ▼           ▼
Détection  Détection
fraude     voix externe
 │
 ▼
Base de données
```

---

## 🛠️ Stack Technique

| Composant                | Technologie                 |
| ------------------------ | --------------------------- |
| Vision par ordinateur    | MediaPipe + OpenCV + YOLOv8 |
| Détection du regard      | L2CS-Net                    |
| Analyse audio            | WebRTC + pyAudioAnalysis    |
| Backend                  | FastAPI + WebSocket         |
| Frontend                 | React.js                    |
| Base de données          | SQLite                      |
| Communication temps réel | WebSocket                   |

---

## 📂 Structure du Projet

```text
proctorAI/
│
├── backend/
│   ├── main.py
│   ├── detection.py
│   ├── audio_detection.py
│   ├── database.py
│   └── proctorAI.db
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## ⚙️ Installation

### Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```



---


---

Tunisie
