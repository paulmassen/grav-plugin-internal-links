# Internal Links

Plugin pour l’éditeur Markdown CodeMirror de Grav 2. Il nécessite Admin2 2.1.35 ou supérieur et le plugin API 1.0.51 ou supérieur. Ces versions correspondent aux versions examinées ; aucune autre version n’a été validée en conditions réelles.

Pour l’installer manuellement, placez le dossier `internal-links` dans `user/plugins/`, puis rechargez Admin2. Le plugin est activé par défaut. Le compte doit disposer de `api.access` et `api.pages.read`.

Sélectionnez du texte, cliquez sur « Insérer un lien interne », puis choisissez une page. Sans sélection, le lien est inséré avec le curseur entre les crochets. La recherche et la navigation chargent les résultats par pages de 50 au maximum (la configuration API peut imposer une limite inférieure).

L’interface est disponible en français, anglais et espagnol. Les autres langues utilisent l’anglais. Rechargez Admin2 après un changement de langue pour actualiser le bouton et le titre de la fenêtre.

## Limites

- L’API de modal Admin2 ne fournit pas l’éditeur appelant ni sa sélection. Ce plugin identifie l’éditeur à partir du bouton de barre d’outils encore focalisé et de la propriété non publique `__cmView`. Si l’identification échoue, aucune insertion n’a lieu. Cette intégration peut casser si Admin2 change son DOM ou sa gestion du focus. Safari sur macOS ne focalise pas toujours les boutons au clic : utilisez la navigation clavier pour focaliser et activer le bouton.
- Si le document ou la sélection change pendant l’ouverture de la fenêtre, l’insertion est refusée : fermez la fenêtre et recommencez. Cela concerne notamment les modifications collaboratives.
- En multilingue, le sélecteur exige la langue de contenu fournie par Admin2 ; si elle manque, le chargement échoue plutôt que de deviner.
- Le lien utilise la route renvoyée par l’API, le préfixe linguistique calculé par Grav et le chemin d’installation du serveur API. Les alias personnalisés ou traduits, une base de pages multisite, `system.pages.append_url_extension` ou un serveur API distinct du site public peuvent nécessiter un ajustement manuel. Une page non publiée ou non routable peut ne pas être accessible aux visiteurs.
- Le fonctionnement avec d’autres éditeurs Markdown ou des versions différentes d’Admin2 n’est pas garanti.
