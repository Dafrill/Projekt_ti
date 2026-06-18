#!/bin/bash
# Włączenie autostartu PostgreSQL i uruchomienie teraz
sudo systemctl enable --now postgresql

# Samo uruchomienie (bez autostartu):
# sudo systemctl start postgresql
